import { SiDiscord, SiGithub, SiMedium, SiTelegram } from "react-icons/si";
import { Globe } from "lucide-react";
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
    <footer className="w-full py-8 mt-auto">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h3 className="text-xl font-medium text-white/90">SKYOPS LABS</h3>
            <p className="mt-2 text-sm text-white/60">
              © {new Date().getFullYear()} SkyOps Labs. All rights reserved.
            </p>
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
        </div>
      </div>
    </footer>
  );
}