import {
  Trophy,
  Lock,
  ArrowLeft,
  User,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/card';
import {
  errorToastStyle,
  getPasswordValidationError,
  getUsernameValidationError,
  handleLoginSubmit
} from '../utils/functions';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Button } from '../components/button';
import { useCustomHook } from '../utils/hooks';

interface LoginProps {
  onBack?: () => void;
}

export default function Login({ onBack }: LoginProps) {
  const {
    login,
    Username,
    Password,
    Loading,
    setUsername,
    setPassword,
    setLoading,
    showPassword,
    setShowPassword,
    fieldErrors,
    setFieldErrors,
    sessionExpired,
  } = useCustomHook();

  useEffect(() => {
    if (sessionExpired) {
      toast.error('Your session expired. Please sign in again.', errorToastStyle);
    }
  }, [sessionExpired]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-purple-950/20 relative overflow-hidden">
      {/* Back to landing button */}
      {onBack && (
        <div className="absolute top-4 left-4 z-20">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      )}
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[560px] px-4"
      >
        <Card className="w-full glass border-border/50 shadow-2xl shadow-purple-500/20">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 blur-xl bg-primary/50 rounded-full" />
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-3xl gradient-text">Strike Manager</CardTitle>
              <CardDescription className="mt-2">Enter your credentials to access the system</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) =>
                handleLoginSubmit(
                  e,
                  login,
                  Username,
                  Password,
                  setLoading,
                  setFieldErrors
                )
              }
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={Username}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUsername(value);
                    setFieldErrors((currentErrors) => ({
                      ...currentErrors,
                      username: getUsernameValidationError(value)
                    }));
                  }}
                  autoComplete="username"
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  disabled={Loading}
                  className="bg-input-background border-border/50"
                />
                {fieldErrors.username && <p id="username-error" className="text-sm text-destructive">{fieldErrors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={Password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
                      setFieldErrors((currentErrors) => ({
                        ...currentErrors,
                        password: getPasswordValidationError(value)
                      }));
                    }}
                    autoComplete="current-password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    disabled={Loading}
                    className="bg-input-background border-border/50 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={Loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p id="password-error" className="text-sm text-destructive">{fieldErrors.password}</p>}
              </div>
              <Button 
                type="submit" 
                disabled={Loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/50"
              >
                {Loading ? <><Loader2 className="h-4 w-4 animate-spin" />Logging in...</> : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
