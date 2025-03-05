import { Globe } from "lucide-react";
import { SiDiscord, SiGithub, SiMedium, SiTelegram } from "react-icons/si";
import { FaTwitter } from "react-icons/fa";

const socialLinks = [
  {
    name: "Website",
    icon: Globe,
    url: "https://skyopslabs.ai",
  },
  {
    name: "Twitter",
    icon: FaTwitter,
    url: "https://twitter.com/skyopslabs",
  },
  {
    name: "Telegram",
    icon: SiTelegram,
    url: "https://t.me/skyopslabs",
  },
  {
    name: "Discord",
    icon: SiDiscord,
    url: "https://discord.gg/skyopslabs",
  },
  {
    name: "GitHub",
    icon: SiGithub,
    url: "https://github.com/skyopslabs",
  },
  {
    name: "Medium",
    icon: SiMedium,
    url: "https://medium.com/@skyopslabs",
  },
];

export function Footer() {
  return (
    <footer className="w-full py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h2 className="text-3xl font-mono text-white">We'd love to hear from you!</h2>

          <p className="text-white/60">
            Whether you're looking to join our team, collaborate with us or need support, the Skyops team is here to help.
          </p>

          <div className="text-white/60">
            Email us at{" "}
            <a href="mailto:support@skyopslabs.ai" className="text-white hover:text-white/80">
              support@skyopslabs.ai
            </a>
            {" "}or{" "}
            <a href="mailto:contact@skyopslabs.ai" className="text-white hover:text-white/80">
              contact@skyopslabs.ai
            </a>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors duration-200"
                aria-label={link.name}
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 text-white/60">
            Powered by
            <a href="https://skyopslabs.ai" target="_blank" rel="noopener noreferrer">
              <img src="/footer.png" alt="Skyops Logo" style={{ height: '2.15rem' }} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}