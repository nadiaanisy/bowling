import {
  useBowlingHook,
  useCustomHook
} from '../misc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { handleLoginButton } from '../functions';

export default function Login() {
  const {
    password,
    setPassword,
  } = useCustomHook();
  const { login } = useBowlingHook();

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-bold">My League Manager</CardTitle>
          <CardDescription className="text-center">Enter your password to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleLoginButton(e, login, password)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Hint: bowling123</p>
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
