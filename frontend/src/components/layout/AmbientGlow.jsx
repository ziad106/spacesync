export default function AmbientGlow() {
  return (
    <div
      className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-tertiary/5 rounded-full pointer-events-none -z-10"
      style={{ filter: 'blur(120px)' }}
    />
  );
}
