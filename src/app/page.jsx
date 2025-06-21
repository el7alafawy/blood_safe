'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './services/api';
import { 
  Heart, 
  Droplet, 
  MapPin, 
  Clock, 
  Users, 
  Shield, 
  Star,
  ChevronRight,
  Play,
  Building2,
  User,
  Activity,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const BloodDonationLanding = () => {
  const router = useRouter();
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const stats = [
    { number: "24,000+", label: "حياة تم إنقاذها", icon: Heart },
    { number: "850+", label: "متبرع نشط", icon: Users },
    { number: "45+", label: "مستشفى شريك", icon: Building2 },
    { number: "99.2%", label: "معدل النجاح", icon: TrendingUp }
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  useEffect(() => {
    setIsVisible(true);
    setIsAuthenticated(authService.isAuthenticated());
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartNow = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const StorySection = ({ title, content, icon: Icon, gradient, delay = 0 }) => (
    <div 
      className={`relative overflow-hidden rounded-2xl p-8 text-white transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms`, background: gradient }}
    >
      <div className="absolute top-4 right-4 opacity-20">
        <Icon className="h-24 w-24" />
      </div>
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-lg leading-relaxed opacity-90">{content}</p>
      </div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white opacity-5 rounded-full"></div>
    </div>
  );

  const FloatingBloodDrop = ({ delay = 0, size = 'w-4 h-4' }) => (
    <div 
      className={`absolute ${size} bg-red-500 rounded-full opacity-20 animate-pulse`}
      style={{ 
        animationDelay: `${delay}ms`,
        // top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden" dir="rtl">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingBloodDrop key={i} delay={i * 200} />
        ))}
      </div>

      {/* Navigation */}
      <nav className="z-50 bg-white/90 backdrop-blur-md shadow-sm fixed w-full top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="relative">
                <Droplet className="h-10 w-10 text-red-500 animate-pulse" />
                <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  قطرة حياة
                </h1>
                <p className="text-xs text-gray-500">معًا ننقذ الأرواح</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <a href="#about" className="text-gray-700 hover:text-red-500 transition-colors">عن المشروع</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-red-500 transition-colors">كيف يعمل</a>
              <a href="#contact" className="text-gray-700 hover:text-red-500 transition-colors">تواصل</a>
              <button 
                onClick={() => isAuthenticated ? router.push('/dashboard') : router.push('/login')}
                className="ms-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all"
              >
                {isAuthenticated ? 'لوحة التحكم' : 'تسجيل الدخول'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="mb-8">
              <div className="mt-2 inline-flex items-center space-x-2 rtl:space-x-reverse bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="h-4 w-4 animate-pulse" />
                <span>كل قطرة تعني حياة</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold mb-6">
                <span className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  أنقذ حياة
                </span>
                <br />
                <span className="text-gray-800">بقطرة واحدة</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                منصة ذكية تربط المتبرعين بالمحتاجين في الوقت المناسب. 
                كن جزءًا من قصة إنقاذ حياة حقيقية واصنع فرقًا يدوم للأبد.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 rtl:sm:space-x-reverse mb-12">
              <button 
                onClick={handleStartNow}
                className="group bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex items-center space-x-3 rtl:space-x-reverse text-lg font-semibold"
              >
                <span>{isAuthenticated ? 'لوحة التحكم' : 'ابدأ التبرع الآن'}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white text-gray-700 px-8 py-4 rounded-2xl border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 rtl:space-x-reverse">
                <Play className="h-5 w-5 text-red-500" />
                <span>شاهد كيف يعمل</span>
              </button>
            </div>

            {/* Live Stats */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={index} 
                      className={`text-center transform transition-all duration-500 ${
                        currentStat === index ? 'scale-110' : 'scale-100'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 ${
                        currentStat === index 
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stat.number}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Blood Types */}
        <div className="absolute inset-0 pointer-events-none">
          {bloodTypes.map((type, index) => (
            <div
              key={type}
              className="absolute animate-bounce text-red-500 font-bold text-2xl opacity-30"
              style={{
                top: `${15 + (index * 10)}%`,
                left: `${10 + (index * 10)}%`,
                animationDelay: `${index * 0.5}s`,
                animationDuration: '3s'
              }}
            >
              {type}
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section id="about" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 mt-4">
            <h2 className="p-2 text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              قصة تبدأ بك
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              في كل ثانية، هناك شخص في مكان ما يحتاج للدم لينجو بحياته. نحن هنا لنجعل هذا الإنقاذ ممكنًا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <StorySection
              title="المشكلة"
              content="يموت آلاف الأشخاص سنويًا بسبب نقص الدم المتاح في الوقت المناسب. التنسيق بين المتبرعين والمستشفيات معقد ويستغرق وقتًا ثمينًا."
              icon={AlertCircle}
              gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              delay={200}
            />
            <StorySection
              title="الحل"
              content="منصة ذكية تستخدم الذكاء الاصطناعي لمطابقة المتبرعين مع المحتاجين فورًا، مع نظام إشعارات فوري وخرائط تفاعلية لأسرع وصول."
              icon={CheckCircle}
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              delay={400}
            />
            <StorySection
              title="الأثر"
              content="حياة تُنقذ كل يوم، عائلات تجتمع مرة أخرى، مجتمع يتكاتف لمساعدة بعضه البعض. هذا هو الأثر الحقيقي لكل تبرع."
              icon={Heart}
              gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 p-2 mt-4">
            <h2 className="text-5xl font-bold mb-6 text-gray-800">كيف يعمل النظام</h2>
            <p className="text-xl text-gray-600">عملية بسيطة وسريعة لإنقاذ الأرواح</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "سجل واختر دورك",
                description: "سجل كمتبرع أو مريض أو مستشفى. املأ المعلومات الأساسية وفصيلة الدم.",
                icon: User,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "02", 
                title: "المطابقة الذكية",
                description: "النظام يطابق الطلبات مع المتبرعين المناسبين تلقائيًا حسب الموقع وفصيلة الدم.",
                icon: Activity,
                color: "from-green-500 to-emerald-500"
              },
              {
                step: "03",
                title: "إنقاذ حياة",
                description: "تواصل فوري، تنسيق الموعد، وإنقاذ حياة حقيقية. كل هذا في دقائق معدودة.",
                icon: Heart,
                color: "from-red-500 to-pink-500"
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${step.color} text-white mb-6 relative`}>
                    <Icon className="h-10 w-10" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-12 h-0.5 bg-gradient-to-r from-gray-300 to-transparent transform -translate-x-6"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8 text-gray-800">
                تقنية متقدمة لإنقاذ الأرواح
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "إشعارات فورية",
                    description: "تنبيهات لحظية عند وجود طلب مطابق لفصيلة دمك في منطقتك",
                    icon: AlertCircle
                  },
                  {
                    title: "خرائط تفاعلية",
                    description: "اعثر على أقرب مستشفى أو مركز تبرع مع أفضل المسارات",
                    icon: MapPin
                  },
                  {
                    title: "نظام آمن",
                    description: "حماية كاملة لبياناتك الشخصية والطبية مع أعلى معايير الأمان",
                    icon: Shield
                  },
                  {
                    title: "متابعة مستمرة",
                    description: "تتبع تبرعاتك وأثرها في إنقاذ الأرواح مع تقارير مفصلة",
                    icon: TrendingUp
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 ">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative text-black">
              <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">طلب عاجل</h3>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Droplet className="h-5 w-5 text-red-500" />
                      <span className="font-medium">فصيلة O+ • وحدتان</span>
                    </div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">مستشفى 57357 • 2.3 كم</span>
                    </div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">مطلوب خلال ساعتين</span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all">
                      تبرع الآن
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl font-bold text-white mb-6">
            ابدأ رحلة الإنقاذ اليوم
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            انضم إلى آلاف الأبطال الذين يصنعون الفرق كل يوم. 
            تبرعك البسيط قد يكون الأمل الوحيد لشخص ينتظر معجزة.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 space-x-6">
            <button 
              onClick={handleRegister}
              className="group bg-white text-red-500 px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex items-center space-x-3 rtl:space-x-reverse"
            >
              <Heart className="h-6 w-6 group-hover:animate-pulse" />
              <span>سجل كمتبرع</span>
            </button>
            <button 
              onClick={handleLogin}
              className="group border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-red-500 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 rtl:space-x-reverse"
            >
              <User className="h-6 w-6" />
              <span>سجل كمريض</span>
            </button>
          </div>
        </div>
        
        {/* Floating Hearts */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <Heart
              key={i}
              className="absolute text-white/20 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                <Droplet className="h-8 w-8 text-red-500" />
                <h3 className="text-2xl font-bold">قطرة حياة</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                منصة تهدف لربط المتبرعين بالمحتاجين وإنقاذ الأرواح بأسرع وقت ممكن.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">روابط سريعة</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition-colors">عن المشروع</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">كيف يعمل</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">سياسة الخصوصية</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">للمستشفيات</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition-colors">انضم كمستشفى</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">إدارة المخزون</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">التقارير</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">الدعم التقني</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">تواصل معنا</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-400">
                  <Phone className="h-5 w-5" />
                  <span>+20 123 456 789</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-400">
                  <Mail className="h-5 w-5" />
                  <span>info@blood-donation.com</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-400">
                  <Globe className="h-5 w-5" />
                  <span>www.qatrat-hayah.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 قطرة حياة. جميع الحقوق محفوظة. صُنع بـ <Heart className="inline h-4 w-4 text-red-500" /> لإنقاذ الأرواح
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BloodDonationLanding;