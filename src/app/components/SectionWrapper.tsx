export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="text-lg font-bold text-[#2C2A25] mb-4">{title}</h3>
    {children}
  </div>
);