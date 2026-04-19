import AmbientGlow from '../components/layout/AmbientGlow';
import RegisterForm from '../components/auth/RegisterForm';

export default function Register() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <AmbientGlow />
      <div className="w-full max-w-[440px]">
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 32" }}>hub</span>
              <span className="text-xs font-mono text-on-surface-variant/40 uppercase tracking-widest">SpaceSync</span>
            </div>
            <h1 className="text-5xl font-headline font-bold text-primary tracking-[-0.02em] leading-none mb-3">
              Initialize<br />Terminal
            </h1>
            <p className="text-base text-on-surface-variant/60">Register as a new system operator</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
