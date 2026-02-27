import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-[#E01020] border-t-2 border-[#E01020]/30 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <h3 className="text-[#E01020] text-xl font-bold mb-6 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>NEXT LEVEL AUDIO</h3>
            <p className="text-white/70 leading-relaxed font-mono text-sm">
              Your trusted partner for car audio installation, window tinting, and auto accessories in Stroudsburg, PA.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#E01020] text-xl font-bold mb-6 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>QUICK LINKS</h3>
            <ul className="space-y-3 font-mono text-sm">
              <li>
                <Link href="/about" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  ABOUT US
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  SERVICES
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  PRODUCTS
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  CAREERS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  CONTACT
                </Link>
              </li>
              <li>
                <Link href="/#financing" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  FINANCING
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-[#E01020] text-xl font-bold mb-6 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>CONTACT INFO</h3>
            <ul className="space-y-3 text-white/70 font-mono text-sm">
              <li>
                <a href="tel:+15707304433" className="hover:text-[#E01020] transition-colors neon-glow-soft">
                  (570) 730-4433
                </a>
              </li>
              <li className="leading-relaxed">
                944 North 9th Street<br />
                Stroudsburg, PA 18360
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-[#E01020] text-xl font-bold mb-6 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>HOURS</h3>
            <ul className="space-y-3 text-white/70 font-mono text-sm">
              <li>Monday - Friday: 9AM - 7PM</li>
              <li>Saturday: 9AM - 2PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-[#E01020]/30 mt-12 pt-8 text-center">
          <p className="text-white/60 text-sm font-mono">
            © {new Date().getFullYear()} Next Level Audio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

