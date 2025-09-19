import { AuthForm } from '../AuthForm';
import { ThemeProvider } from '../ThemeProvider';

export default function AuthFormExample() {
  return (
    <ThemeProvider>
      <AuthForm onLogin={(username, role) => console.log('Logged in:', username, role)} />
    </ThemeProvider>
  );
}
