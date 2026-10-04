const programs = [
  { title: 'Weight Loss', desc: 'Sustainable, medically-guided weight management tailored to your lifestyle.' },
  { title: 'Diabetes Management', desc: 'Control blood sugar through structured, evidence-based nutrition.' },
  { title: 'Hypertension Care', desc: 'Lower blood pressure safely with targeted lifestyle modifications.' },
  { title: 'Fatty Liver Disease', desc: 'Reverse fatty liver progression through specific dietary protocols.' },
  { title: 'Muscle Gain', desc: 'Evidence-based nutritional protocols for healthy, lean muscle growth.' },
  { title: 'Fertility & Hormonal Health', desc: 'Optimize hormonal balance and support fertility naturally.' },
];

export default function ProgramGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {programs.map((program, idx) => (
        <div 
          key={idx} 
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group cursor-pointer"
        >
          {/* Image Placeholder */}
          <div className="h-48 bg-slate-100 relative w-full flex items-center justify-center border-b border-slate-50">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              Image Placeholder
            </span>
          </div>
          
          {/* Card Content */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
              {program.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {program.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}