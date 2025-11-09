import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, CheckCircle, XCircle, UserCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
import { getBusinessAppointments, updateAppointmentStatus } from '../lib/api';
import type { Appointment } from '../lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getBusinessAppointments();
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppointment || !newStatus) return;
    
    try {
      await updateAppointmentStatus(selectedAppointment.id, newStatus);
      toast.success('Appointment status updated successfully');
      setStatusDialogOpen(false);
      setSelectedAppointment(null);
      setNewStatus('');
      loadAppointments();
    } catch (error) {
      toast.error('Failed to update appointment status');
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

  const todayAppointments = appointments.filter(apt => {
    const today = new Date();
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = apt.appointment_date.split('-').map(Number);
    const aptDate = new Date(year, month - 1, day);
    return aptDate.toDateString() === today.toDateString() && apt.status !== 'cancelled';
  });

  const upcomingAppointments = appointments.filter(apt => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = apt.appointment_date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day);
    const today = new Date();
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return appointmentDate > today && apt.status !== 'cancelled';
  });

  const pendingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed'
  );

  const pastAppointments = appointments.filter(apt => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = apt.appointment_date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day);
    const today = new Date();
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return appointmentDate < today || apt.status === 'cancelled' || apt.status === 'completed';
  });

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
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
                <User className="h-4 w-4 mr-1" />
                Customer ID: {appointment.customer_id}
              </div>
            </div>
            
            <div className="text-sm">
              <p className="text-gray-600">
                Duration: {appointment.duration_minutes} minutes
              </p>
              {appointment.business_note && (
                <p className="text-gray-600 mt-1">
                  Note: {appointment.business_note}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            {appointment.status === 'confirmed' && (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setNewStatus('completed');
                    setStatusDialogOpen(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setNewStatus('cancelled');
                    setStatusDialogOpen(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Business Dashboard</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/business/profile')}>
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-600">Total Appointments</CardDescription>
              <CardTitle className="text-3xl font-semibold text-gray-900">{appointments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-600">Today's Appointments</CardDescription>
              <CardTitle className="text-3xl font-semibold text-blue-600">{todayAppointments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-600">Confirmed</CardDescription>
              <CardTitle className="text-3xl font-semibold text-green-600">{pendingAppointments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-600">Completed</CardDescription>
              <CardTitle className="text-3xl font-semibold text-green-600">
                {appointments.filter(a => a.status === 'completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Appointments Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="today">
              Today ({todayAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Confirmed ({pendingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            {loading ? (
              <Card className="border shadow-sm">
                <CardContent className="py-8 text-center text-gray-500">
                  Loading appointments...
                </CardContent>
              </Card>
            ) : todayAppointments.length === 0 ? (
              <Card className="border shadow-sm">
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No appointments today</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {loading ? (
              <Card className="border shadow-sm">
                <CardContent className="py-8 text-center text-gray-500">
                  Loading appointments...
                </CardContent>
              </Card>
            ) : pendingAppointments.length === 0 ? (
              <Card className="border shadow-sm">
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No confirmed appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {loading ? (
              <Card className="border shadow-sm">
                <CardContent className="py-8 text-center text-gray-500">
                  Loading appointments...
                </CardContent>
              </Card>
            ) : upcomingAppointments.length === 0 ? (
              <Card className="border shadow-sm">
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No upcoming appointments</p>
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
              <Card className="border shadow-sm">
                <CardContent className="py-8 text-center text-gray-500">
                  Loading appointments...
                </CardContent>
              </Card>
            ) : pastAppointments.length === 0 ? (
              <Card className="border shadow-sm">
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

      {/* Status Update Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to update this appointment to "{newStatus}"?
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <strong>Appointment:</strong> #{selectedAppointment.appointment_id}
              </p>
              <p className="text-sm">
                <strong>Date:</strong> {format(new Date(selectedAppointment.appointment_date), 'MMM dd, yyyy')}
              </p>
              <p className="text-sm">
                <strong>Time:</strong> {selectedAppointment.appointment_time.substring(0, 5)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
