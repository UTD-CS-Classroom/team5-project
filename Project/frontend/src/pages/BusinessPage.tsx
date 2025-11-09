import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { getBusinessById, getBusinessServices, getAvailableTimeSlots, getBookedSlots, createAppointment } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Business, Service, TimeSlot } from '../lib/api';
import { toast } from 'sonner';

export default function BusinessPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userType, isAuthenticated } = useAuth();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]); // Changed to string array for generated time slots
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState<number | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(); // Changed to string
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBusinessData();
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      loadTimeSlots();
    }
  }, [id, selectedDate]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const [businessRes, servicesRes] = await Promise.all([
        getBusinessById(Number(id)),
        getBusinessServices(Number(id)),
      ]);
      setBusiness(businessRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      toast.error('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedDate) return;
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await getAvailableTimeSlots(Number(id), dateStr);
      const bookedResponse = await getBookedSlots(Number(id), dateStr);
      const slots: TimeSlot[] = response.data;
      const bookedSlots: string[] = bookedResponse.data.booked_slots;
      
      // Get current time if selected date is today
      const now = new Date();
      const isSelectedDateToday = isToday(selectedDate);
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      // Generate individual time slots from the time ranges
      const generatedSlotsSet = new Set<string>();
      slots.forEach(slot => {
        const [startHour, startMin] = slot.start_time.split(':').map(Number);
        const [endHour, endMin] = slot.end_time.split(':').map(Number);
        const duration = slot.slot_duration_minutes || 30;
        
        let slotHour = startHour;
        let slotMin = startMin;
        
        while (slotHour < endHour || (slotHour === endHour && slotMin < endMin)) {
          // Skip past time slots if selected date is today
          if (isSelectedDateToday) {
            if (slotHour < currentHour || (slotHour === currentHour && slotMin <= currentMin)) {
              slotMin += duration;
              if (slotMin >= 60) {
                slotHour += Math.floor(slotMin / 60);
                slotMin = slotMin % 60;
              }
              continue;
            }
          }
          
          // Check if this time slot is already booked
          const time24 = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}:00`;
          const isBooked = bookedSlots.includes(time24);
          
          if (!isBooked) {
            const hour12 = slotHour % 12 || 12;
            const ampm = slotHour < 12 ? 'AM' : 'PM';
            const timeStr = `${hour12}:${slotMin.toString().padStart(2, '0')} ${ampm}`;
            generatedSlotsSet.add(timeStr);
          }
          
          slotMin += duration;
          if (slotMin >= 60) {
            slotHour += Math.floor(slotMin / 60);
            slotMin = slotMin % 60;
          }
        }
      });
      
      setTimeSlots(Array.from(generatedSlotsSet).sort((a, b) => {
        const parseTime = (timeStr: string) => {
          const [time, period] = timeStr.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          let hour24 = hours;
          if (period === 'PM' && hours !== 12) hour24 += 12;
          if (period === 'AM' && hours === 12) hour24 = 0;
          return hour24 * 60 + minutes;
        };
        return parseTime(a) - parseTime(b);
      }));
    } catch (error) {
      toast.error('Failed to load available time slots');
    }
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated || userType !== 'customer') {
      toast.error('Please login as a customer to book appointments');
      navigate('/login', { state: { from: `/business/${id}` } });
      return;
    }

    if (!selectedService || !selectedTimeSlot || !selectedDate) {
      toast.error('Please select a service, date, and time slot');
      return;
    }

    try {
      // Convert 12-hour format back to 24-hour for backend
      const [time, period] = selectedTimeSlot.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      const time24 = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      
      const selectedServiceData = services.find(s => s.id === selectedService);
      
      await createAppointment({
        business_id: Number(id),
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: time24,
        duration_minutes: selectedServiceData?.duration_minutes || 30,
      });
      toast.success('Appointment booked successfully!');
      setBookingDialogOpen(false);
      setSelectedService(undefined);
      setSelectedTimeSlot(undefined);
      loadTimeSlots(); // Refresh available slots
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Business not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </header>

      {/* Business Info */}
      <section className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{business.business_name}</CardTitle>
                <CardDescription className="text-lg">{business.address}</CardDescription>
              </div>
              {business.specialty && (
                <Badge className="text-base px-4 py-2">{business.specialty}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{business.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {business.phone && (
                <p className="text-gray-600">📞 Phone: {business.phone}</p>
              )}
              {business.email && (
                <p className="text-gray-600">✉️ Email: {business.email}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Services Offered</h2>
            <div className="space-y-4">
              {services.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No services available
                  </CardContent>
                </Card>
              ) : (
                services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all ${
                      selectedService === service.id ? 'ring-2 ring-blue-600' : ''
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                        <div className="flex items-center text-green-600 font-bold">
                          <DollarSign className="h-5 w-5" />
                          {service.price.toFixed(2)}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Calendar & Booking */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Book an Appointment</h2>
            <Card>
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
                <CardDescription>Choose your preferred appointment date and time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calendar */}
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border"
                  />
                </div>

                <Separator />

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <p className="font-semibold mb-3">
                      Available times for {format(selectedDate, 'MMMM d, yyyy')}:
                    </p>
                    {timeSlots.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No available time slots</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={selectedTimeSlot === slot ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => setSelectedTimeSlot(slot)}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {slot}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Book Button */}
                <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!selectedService || !selectedTimeSlot}
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Your Appointment</DialogTitle>
                      <DialogDescription>
                        Review your appointment details before confirming
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <p className="font-semibold">Business:</p>
                        <p className="text-gray-600">{business.business_name}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Service:</p>
                        <p className="text-gray-600">
                          {services.find((s) => s.id === selectedService)?.name} - $
                          {services.find((s) => s.id === selectedService)?.price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">Date & Time:</p>
                        <p className="text-gray-600">
                          {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at{' '}
                          {selectedTimeSlot}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setBookingDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleBookAppointment} className="flex-1">
                        Confirm Booking
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
