import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerAppointments, cancelAppointment } from '../lib/api';
import type { Appointment } from '../lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CustomerAppointments() {
  const navigate = useNavigate();
  const { } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getCustomerAppointments();
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      await cancelAppointment(selectedAppointment.id);
      toast.success('Appointment cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const upcomingAppointments = appointments.filter(apt => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = apt.appointment_date.split('-').map(Number);
    const aptDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== 'cancelled' && apt.status !== 'completed';
  });
  
  const pastAppointments = appointments.filter(apt => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = apt.appointment_date.split('-').map(Number);
    const aptDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate < today || apt.status === 'cancelled' || apt.status === 'completed';
  });

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">
                Appointment #{appointment.appointment_id}
              </h3>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {(() => {
                  const [year, month, day] = appointment.appointment_date.split('-').map(Number);
                  return format(new Date(year, month - 1, day), 'MMM dd, yyyy');
                })()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {appointment.appointment_time.substring(0, 5)}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Business ID: {appointment.business_id}
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div className="text-sm">
              <p className="text-gray-600">
                Duration: {appointment.duration_minutes} minutes
              </p>
            </div>
          </div>
          
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setSelectedAppointment(appointment);
                setCancelDialogOpen(true);
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-sm text-gray-500">View and manage your appointments</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  Loading appointments...
                </CardContent>
              </Card>
            ) : upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500 mb-4">No upcoming appointments</p>
                  <Button onClick={() => navigate('/')}>Find a Business</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  Loading appointments...
                </CardContent>
              </Card>
            ) : pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No past appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <strong>Date:</strong> {format(new Date(selectedAppointment.appointment_date), 'MMM dd, yyyy')}
              </p>
              <p className="text-sm">
                <strong>Time:</strong> {selectedAppointment.appointment_time.substring(0, 5)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
