import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthDialog({ open, onOpenChange, defaultMode = 'login' }: AuthDialogProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [userType, setUserType] = useState<'customer' | 'business'>('customer');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    business_name: '',
    phone: '',
    address: '',
    specialty: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password, userType);
      onOpenChange(false);
      navigate('/dashboard');
    } catch (error) {
      // Error already handled by login function
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (userType === 'customer' && !formData.full_name) {
      toast.error('Please enter your full name');
      return;
    }

    if (userType === 'business' && !formData.business_name) {
      toast.error('Please enter your business name');
      return;
    }

    try {
      setLoading(true);
      const { customerRegister, businessRegister } = await import('../lib/api');
      
      if (userType === 'customer') {
        await customerRegister({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
        });
      } else {
        await businessRegister({
          email: formData.email,
          password: formData.password,
          business_name: formData.business_name,
          phone: formData.phone,
          address: formData.address,
          specialty: formData.specialty,
        });
      }

      toast.success('Registration successful! Please login.');
      setMode('login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Login to your account to continue'
              : 'Register a new account to get started'}
          </DialogDescription>
        </DialogHeader>

        {/* User Type Toggle */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={userType === 'customer' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setUserType('customer')}
          >
            Customer
          </Button>
          <Button
            type="button"
            variant={userType === 'business' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setUserType('business')}
          >
            Business
          </Button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {mode === 'register' && (
            <>
              {userType === 'customer' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      type="text"
                      name="full_name"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone (Optional)</label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Name</label>
                    <Input
                      type="text"
                      name="business_name"
                      placeholder="Your Business Name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      type="text"
                      name="address"
                      placeholder="123 Business St, Dallas, TX"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Specialty</label>
                    <Input
                      type="text"
                      name="specialty"
                      placeholder="e.g., Hair Salon, Dental"
                      value={formData.specialty}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>

        <Separator />

        <div className="text-center text-sm">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline font-medium"
                onClick={() => setMode('register')}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline font-medium"
                onClick={() => setMode('login')}
              >
                Login
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
