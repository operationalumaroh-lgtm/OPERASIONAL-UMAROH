import React, { useState, useRef, useEffect } from 'react';
import { Calendar, RefreshCw, Download, MapPin, DollarSign, Wand2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { HANDLING_TIERS, HANDLING_CONSTANTS } from '../data/handlingSaudi';
import { AIPromptInput } from './AIPromptInput';
import { Type } from '@google/genai';
import { logoBase64 } from '../utils/logoBase64';

export const HandlingTemplateView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [kurs, setKurs] = useState<number>(HANDLING_CONSTANTS.defaultKurs);
  const [marginPercent, setMarginPercent] = useState<number>(HANDLING_CONSTANTS.defaultMarginPercent);
  const printRef = useRef<HTMLDivElement>(null);

  const [paxRows, setPaxRows] = useState(Array(11).fill({ pax: '', harga: '' }));
  const [includeRows, setIncludeRows] = useState(Array(13).fill({ item: '' }));

  const handlingSchema = {
    type: Type.OBJECT,
    properties: {
      selectedDate: { type: Type.STRING, description: "Tanggal keberangkatan dalam format YYYY-MM-DD" },
      marginPercent: { type: Type.NUMBER, description: "Persentase margin keuntungan" }
    }
  };

  const handlingSystemInstruction = "Anda adalah asisten AI untuk mengisi form Pricelist Handling Saudi. Ekstrak informasi dari teks yang diberikan pengguna dan kembalikan dalam format JSON sesuai schema. Jika ada informasi yang tidak disebutkan, biarkan kosong atau gunakan nilai default yang masuk akal.";

  const handleDataParsed = (data: any) => {
    if (data.selectedDate) setSelectedDate(data.selectedDate);
    if (data.marginPercent !== undefined) setMarginPercent(data.marginPercent);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const autoFillData = () => {
    const newRows = HANDLING_TIERS.map(tier => {
      const hppPlusAdm = tier.hpp + HANDLING_CONSTANTS.adminFee;
      const beli = hppPlusAdm * kurs;
      const margin = beli * (marginPercent / 100);
      const jual = beli + margin;
      
      return {
        pax: `${tier.minPax} - ${tier.maxPax}`,
        harga: formatCurrency(jual)
      };
    });
    setPaxRows(newRows);
  };

  // Auto-fill on mount
  useEffect(() => {
    autoFillData();
    
    // Pre-fill some default includes based on standard handling
    const defaultIncludes = [
      "Handling Kedatangan Bandara Madinah / Jeddah",
      "Handling kepulangan di Bandara Jeddah / Madinah",
      "Biaya Porter Bandara Madinah & Jeddah",
      "Handling Check in dan Check out Hotel Madinah dan Makkah",
      "Biaya Tips Bellboy hotel Makkah dan Madinah",
      "Biaya Tips Driver selama perjalanan",
      "Air Mineral selama perjalanan",
      "Snacks box (makanan Ringan saat perjalanan Madinah - Makkah)",
      "Snacks box (makanan Ringan selama program ziarah)",
      "Snacks box (makanan Ringan saat perjalanan Makkah – Jeddah kepulangan)",
      "Makan siang / makan malam saat kedatangan",
      "Makan siang / makan malam saat kepulangan",
      "Air Zamzam 05 Liter (Apabila Diizinkan)"
    ];
    
    setIncludeRows(defaultIncludes.map(item => ({ item })));
  }, []); // Run once on mount

  // Recalculate when kurs or margin changes
  useEffect(() => {
    autoFillData();
  }, [kurs, marginPercent]);

  const handlePaxChange = (index: number, field: 'pax' | 'harga', value: string) => {
    const newRows = [...paxRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setPaxRows(newRows);
  };

  const handleIncludeChange = (index: number, value: string) => {
    const newRows = [...includeRows];
    newRows[index] = { ...newRows[index], item: value };
    setIncludeRows(newRows);
  };

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    
    setIsGeneratingImage(true);
    
    const originalElement = printRef.current;
    const originalInputs = originalElement.querySelectorAll('input, textarea, select');
    originalInputs.forEach((el: any) => {
      if (el.tagName === 'INPUT') {
        el.setAttribute('value', el.value);
      } else if (el.tagName === 'TEXTAREA') {
        el.innerHTML = el.value;
      }
    });

    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = `${originalElement.offsetWidth}px`;
    document.body.appendChild(clone);

    try {
      // Helper to convert modern color spaces (oklch, oklab) to RGB/HEX
      const convertToRgb = (color: string) => {
        if (!color || (!color.includes('oklch') && !color.includes('oklab'))) return color;
        
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '#000000';
        
        try {
          ctx.fillStyle = color;
          const result = ctx.fillStyle;
          if (result.includes('oklch') || result.includes('oklab')) {
            return '#000000'; // Safe fallback
          }
          return result;
        } catch (e) {
          return '#000000';
        }
      };

      // Sanitize all elements in the clone
      const allClones = clone.querySelectorAll('*');
      const sanitizeNode = (cloned: HTMLElement) => {
        const computed = window.getComputedStyle(cloned);
        const propsToCheck = [
          'color', 'background-color', 'border-color', 
          'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
          'outline-color', 'text-decoration-color', 
          'fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color',
          'caret-color', 'column-rule-color',
          'box-shadow', 'filter', 'backdrop-filter', 'background-image'
        ];

        propsToCheck.forEach(prop => {
          const val = computed.getPropertyValue(prop);
          if (val && (val.includes('oklch') || val.includes('oklab'))) {
            if (prop === 'box-shadow' || prop === 'filter' || prop === 'backdrop-filter' || prop === 'background-image') {
              cloned.style.setProperty(prop, 'none', 'important');
            } else {
              const rgb = convertToRgb(val);
              cloned.style.setProperty(prop, rgb, 'important');
            }
          }
        });
      };

      sanitizeNode(clone);
      allClones.forEach(node => sanitizeNode(node as HTMLElement));

      const cloneInputs = clone.querySelectorAll('input, textarea, select');
      cloneInputs.forEach((el: any) => {
        const div = document.createElement('div');
        div.className = el.className;
        div.style.cssText = el.style.cssText;
        
        const computedStyle = window.getComputedStyle(el);
        div.style.textAlign = computedStyle.textAlign;
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        if (computedStyle.textAlign === 'center') {
            div.style.justifyContent = 'center';
        } else if (computedStyle.textAlign === 'right') {
            div.style.justifyContent = 'flex-end';
        } else {
            div.style.justifyContent = 'flex-start';
        }
        
        div.innerText = el.value || el.getAttribute('value') || '';
        
        if (el.parentNode) {
          el.parentNode.replaceChild(div, el);
        }
      });

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: Document) => {
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            if (styleTags[i].innerHTML.includes('oklch') || styleTags[i].innerHTML.includes('oklab')) {
              styleTags[i].innerHTML = styleTags[i].innerHTML
                .replace(/oklch\([^)]+\)/g, '#000000')
                .replace(/oklab\([^)]+\)/g, '#000000');
            }
          }
        }
      } as any);

      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `Handling_Template_${selectedDate || 'Draft'}.jpg`;
      link.click();

    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      document.body.removeChild(clone);
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center gap-6 print:p-0 print:bg-white print:block">
      
      <div className="w-full max-w-[210mm]">
        <AIPromptInput 
          onDataParsed={handleDataParsed} 
          schema={handlingSchema} 
          systemInstruction={handlingSystemInstruction} 
          placeholder="Ketik prompt di sini (contoh: Buatkan pricelist handling untuk 12 Desember dengan margin 40%...)"
        />
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-full max-w-[210mm] flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Periode:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none w-36"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <RefreshCw className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Kurs:</span>
            <input
              type="number"
              value={kurs}
              onChange={(e) => setKurs(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none w-28"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="text-gray-500 w-5 h-5" />
            <span className="font-medium text-gray-700">Margin (%):</span>
            <input
              type="number"
              value={marginPercent}
              onChange={(e) => setMarginPercent(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none w-20"
            />
          </div>
          
          <button 
            onClick={autoFillData}
            className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
          >
            <Wand2 className="w-4 h-4" />
            Auto-fill
          </button>
        </div>
        
        <button 
          onClick={handleDownloadImage}
          disabled={isGeneratingImage}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingImage ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isGeneratingImage ? 'Generating JPG...' : 'Download JPG'}
        </button>
      </div>

      {/* A4 Aspect Ratio Container */}
      <div ref={printRef} className="w-[210mm] min-h-[297mm] bg-[#FDB913] shadow-2xl relative text-gray-900 font-sans flex flex-col print:shadow-none print:m-0 border-4 border-purple-500 p-8">
        
        {/* Background Pattern (Subtle) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start relative z-10 mb-8">
          <div className="flex flex-col">
             {/* Logo */}
            <div className="flex items-center gap-3 mb-2">
               <img src={logoBase64} alt="Umaroh Logo" className="h-14" />
            </div>
            <p className="text-[10px] italic font-semibold ml-1 tracking-wide">Platform Digital Umrah & Haji Pertama di Indonesia</p>
          </div>
          
          <div className="border-l-2 border-gray-900 pl-6 py-1">
            <h1 className="text-4xl font-bold leading-tight mb-2">Handling</h1>
            <div className="border-b-2 border-gray-900 w-full mb-2"></div>
            <h3 className="text-xl font-bold">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Periode'}
            </h3>
          </div>
        </div>

        {/* PAX & HARGA Table */}
        <div className="relative z-10 mb-6">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-900 text-[#FDB913] text-center font-bold uppercase text-sm tracking-wider">
                <th className="p-2 border-r border-gray-700 w-1/2">PAX</th>
                <th className="p-2 w-1/2">HARGA</th>
              </tr>
            </thead>
            <tbody>
              {paxRows.map((row, index) => (
                <tr key={index} className="border-b border-gray-200 text-center">
                  <td className="border-r border-gray-200 p-0 h-8">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent text-center outline-none font-medium text-sm"
                      value={row.pax}
                      onChange={(e) => handlePaxChange(index, 'pax', e.target.value)}
                    />
                  </td>
                  <td className="p-0 h-8">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent text-center outline-none font-medium text-sm"
                      value={row.harga}
                      onChange={(e) => handlePaxChange(index, 'harga', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* INCLUDE Table */}
        <div className="relative z-10 flex-grow">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-900 text-[#FDB913] text-center font-bold uppercase text-sm tracking-wider">
                <th className="p-2">INCLUDE</th>
              </tr>
            </thead>
            <tbody>
              {includeRows.map((row, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-0 h-7 px-4">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent outline-none font-medium text-xs"
                      value={row.item}
                      onChange={(e) => handleIncludeChange(index, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
