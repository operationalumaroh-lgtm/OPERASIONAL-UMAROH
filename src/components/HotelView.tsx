import React, { useState, useMemo } from 'react';
import { hotels, Hotel } from '../data/hotels';
import { HotelCard } from './HotelCard';
import { FilterBar } from './FilterBar';
import { HotelDetailModal } from './HotelDetailModal';
import { Building2 } from 'lucide-react';
import { isDateInRange } from '../utils/dateUtils';

export const HotelView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mealFilter, setMealFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const vendors = useMemo(() => {
    const uniqueVendors = new Set(hotels.map(hotel => hotel.vendor));
    return Array.from(uniqueVendors).sort();
  }, []);

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMeal = mealFilter === 'ALL' || hotel.mealPlan === mealFilter;
      const matchesVendor = vendorFilter === 'ALL' || hotel.vendor === vendorFilter;
      const matchesCity = cityFilter === 'ALL' || hotel.city === cityFilter;
      
      let matchesDate = true;
      if (dateFilter) {
        const checkDate = new Date(dateFilter);
        // Check if any season in the hotel covers the selected date
        matchesDate = hotel.seasons.some(season => isDateInRange(checkDate, season.range));
      }

      return matchesSearch && matchesMeal && matchesVendor && matchesCity && matchesDate;
    });
  }, [searchTerm, mealFilter, vendorFilter, cityFilter, dateFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMealFilter('ALL');
    setVendorFilter('ALL');
    setCityFilter('ALL');
    setDateFilter('');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-grow">
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        mealFilter={mealFilter}
        onMealFilterChange={setMealFilter}
        vendorFilter={vendorFilter}
        onVendorFilterChange={setVendorFilter}
        cityFilter={cityFilter}
        onCityFilterChange={setCityFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onResetFilters={handleResetFilters}
        vendors={vendors}
      />

      <div className="mb-6 text-gray-500 text-sm">
        Showing {filteredHotels.length} hotels
      </div>

      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <HotelCard 
              key={hotel.id} 
              hotel={hotel} 
              onClick={setSelectedHotel}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No hotels found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {selectedHotel && (
        <HotelDetailModal 
          hotel={selectedHotel} 
          onClose={() => setSelectedHotel(null)} 
        />
      )}
    </div>
  );
};
