const FeatureCard = ({ icon: Icon, iconBg, iconBorder, title, description, delay }) => {
  return (
    <div
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-surface-dark/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 group animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border-b-4 ${iconBg} ${iconBorder} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
      >
        <Icon size={28} strokeWidth={2.5} className="text-white" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-extrabold text-dark mb-2 leading-tight">{title}</h3>
      <p className="text-dark-light leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
