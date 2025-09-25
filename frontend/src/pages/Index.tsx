import Spline from "@splinetool/react-spline";
import Navbar from "../components/Navbar.jsx";

const HomePage = () => {
    return (
        <div className="relative min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-16 pt-20 pb-12 bg-[#000000] overflow-hidden">
            <Navbar />
            
            {/* Background iframe */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <iframe
                    src="https://sincere-polygon-333639.framer.app/404-2"
                    className="absolute top-[-1] left-70 w-[150vw] h-[150vh] scale-[1.2] z-[0]"
                    frameBorder="0"
                    allowFullScreen
                />
            </div>

            {/* Background blur effects */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-purple-700 opacity-10 blur-[120px] rounded-full z-10"></div>
            <div className="absolute bottom-16 right-8 w-96 h-96 bg-[#bb6ea8] opacity-30 blur-[160px] rounded-full z-10"></div>

            {/* Floating spheres */}
            <div className="absolute bottom-8 left-[1400px] transform translate-x-[-20%] translate-y-[40%] opacity-70 z-[1]">
                <div className="relative">
                    <div
                        className="w-80 h-80 rounded-full relative"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #a855f7, #7c3aed, #5b21b6, #3730a3)',
                            boxShadow: '0 0 100px rgba(168, 85, 247, 0.8), 0 0 200px rgba(168, 85, 247, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.1)',
                            animation: 'sphereGlow 4s ease-in-out infinite alternate'
                        }}
                    >
                        <div
                            className="absolute top-8 left-8 w-16 h-16 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                                filter: 'blur(4px)'
                            }}
                        />
                        <div
                            className="absolute top-12 left-12 w-8 h-8 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 80%)',
                                filter: 'blur(2px)'
                            }}
                        />
                    </div>
                    <div
                        className="absolute inset-0 w-80 h-80 rounded-full animate-pulse"
                        style={{
                            background: 'radial-gradient(circle, transparent 40%, rgba(168, 85, 247, 0.3) 70%, transparent 100%)',
                            animation: 'pulseGlow 3s ease-in-out infinite'
                        }}
                    />
                    <div
                        className="absolute inset-0 w-96 h-96 rounded-full -translate-x-8 -translate-y-8"
                        style={{
                            background: 'radial-gradient(circle, transparent 0%, rgba(168, 85, 247, 0.2) 80%, transparent 100%)',
                            animation: 'pulseGlow 5s ease-in-out infinite reverse'
                        }}
                    />
                </div>
            </div>

            <div className="absolute top-[120px] md:top-[10px] left-[280px] md:left-[600px] transform translate-x-[-50%] translate-y-[-50%] animate-float opacity-70 z-[1]">
                <div className="relative">
                    <div
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full relative"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #a855f7, #7c3aed, #5b21b6, #3730a3)',
                            boxShadow: '0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                            animation: 'sphereGlow 4s ease-in-out infinite alternate'
                        }}
                    >
                        <div
                            className="absolute top-2 left-2 w-4 h-4 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                                filter: 'blur(2px)'
                            }}
                        />
                    </div>
                    <div
                        className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, transparent 40%, rgba(168, 85, 247, 0.3) 70%, transparent 100%)',
                            animation: 'pulseGlow 3s ease-in-out infinite'
                        }}
                    />
                    <div
                        className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 rounded-full -translate-x-4 -translate-y-4"
                        style={{
                            background: 'radial-gradient(circle, transparent 50%, rgba(168, 85, 247, 0.2) 80%, transparent 100%)',
                            animation: 'pulseGlow 5s ease-in-out infinite reverse'
                        }}
                    />
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 px-6 z-20 relative max-w-2xl">
                {/* Hero content */}
                <div className="space-y-8">
                    {/* Main heading */}
                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tight opacity-0 animate-slideInBottom">
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                                Yield
                            </span>
                            <br />
                            <span className="text-white">
                                Optimizer
                            </span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed opacity-0 animate-slideInBottom delay-200 max-w-xl">
                            Maximize your DeFi returns with intelligent yield optimization and seamless user experience.
                        </p>
                    </div>

                    {/* Features grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-0 animate-slideInBottom delay-400">
                        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                                    User Attraction
                                </h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Intuitive interface and competitive yields that draw users naturally to the platform.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white group-hover:text-green-300 transition-colors">
                                    Money Movement
                                </h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Seamless capital flow optimization across multiple DeFi protocols for maximum returns.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m2-2h.01M9 16a2 2 0 00-2 2m0 0a2 2 0 01-2 2m2-2h.01M9 16a2 2 0 012-2m0 0a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                                    Keyless Account
                                </h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Secure, passwordless authentication system for effortless access and enhanced security.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        <circle cx="12" cy="12" r="9" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors">
                                    Stable Coins
                                </h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Support for major stablecoins ensuring reliable value preservation and liquidity.
                            </p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                        <a
                            href="/create-agent"
                            className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 opacity-0 animate-slideInBottom delay-600"
                        >
                            <span>GET STARTED</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>

                    {/* Stats or additional info */}
                    <div className="flex space-x-8 pt-8 opacity-0 animate-slideInBottom delay-800">
                        <div className="text-center">
                            <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                15%+
                            </div>
                            <div className="text-gray-400 text-sm font-medium">Avg APY</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                24/7
                            </div>
                            <div className="text-gray-400 text-sm font-medium">Optimization</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                <span className="text-lg">$</span>0
                            </div>
                            <div className="text-gray-400 text-sm font-medium">Setup Fees</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spline 3D model */}
            <div className="relative flex justify-end w-full md:w-[45%] h-[600px] md:h-[700px] z-10 overflow-visible">
                <div className="scale-[1.2] translate-x-6 md:translate-x-44 md:translate-y-12 w-[100%] h-full">
                    <Spline scene="https://prod.spline.design/bBZhaOPognQ5-DAn/scene.splinecode" />
                </div>
            </div>

            {/* Custom styles */}
            <style >{`
                @keyframes slideInBottom {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes sphereGlow {
                    0%, 100% { 
                        box-shadow: 0 0 100px rgba(168, 85, 247, 0.8), 0 0 200px rgba(168, 85, 247, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.1);
                    }
                    50% { 
                        box-shadow: 0 0 150px rgba(168, 85, 247, 1), 0 0 250px rgba(168, 85, 247, 0.6), inset 0 0 80px rgba(255, 255, 255, 0.2);
                    }
                }

                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }

                .animate-slideInBottom {
                    animation: slideInBottom 0.8s ease-out forwards;
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .delay-200 { animation-delay: 200ms; }
                .delay-400 { animation-delay: 400ms; }
                .delay-600 { animation-delay: 600ms; }
                .delay-800 { animation-delay: 800ms; }
            `}</style>
        </div>
    );
};

export default HomePage;