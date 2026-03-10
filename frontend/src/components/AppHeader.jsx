import "./AppHeader.css";
import logo from "../assets/logo.png";

export default function AppHeader() {
    return (
        <header className="app-header">
            <div className="header-inner">

                {/* LEFT */}
                <div className="header-left">
                    <img src={logo} alt="Visa Way Global" />
                    <div className="brand-text">
                        <strong>Visa Way Global</strong>
                        <span>Immigration · Careers · Resume Services</span>
                    </div>
                </div>

                {/* CENTER */}
                <div className="header-center">
                    ATS Resume Builder
                </div>

                {/* RIGHT */}
                {/* RIGHT */}
                <nav className="header-right">

                    <div className="header-links">
                        <a href="https://visawayglobal.in/" target="_blank" rel="noreferrer">
                            🌐 Website
                        </a>

                        <a
                            href="https://whatsapp.com/channel/0029VbC2gxdDzgT8e4Uw4D34"
                            target="_blank"
                            rel="noreferrer"
                        >
                            🟢 WhatsApp Channel
                        </a>
                    </div>

                    <div className="header-tagline">
                        ATS Resume Builder for Safety Professionals             .
                    </div>

                </nav>

            </div>
        </header>
    );
}
