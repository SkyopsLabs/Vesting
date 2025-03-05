import { SiDiscord, SiGithub, SiTelegram } from "react-icons/si";

const WebsiteIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z" />
  </svg>
);

const TwitterIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const MediumIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const socialLinks = [
  {
    name: "Website",
    icon: WebsiteIcon,
    url: "https://skyopslabs.ai",
  },
  {
    name: "Twitter",
    icon: TwitterIcon,
    url: "https://x.com/SkyopsLabs",
  },
  {
    name: "Telegram",
    icon: SiTelegram,
    url: "https://t.me/SkyopsLabs",
  },
  {
    name: "Discord",
    icon: SiDiscord,
    url: "https://discord.gg/SkyopsLabs",
  },
  {
    name: "GitHub",
    icon: SiGithub,
    url: "https://github.com/SkyopsLabs",
  },
  {
    name: "Medium",
    icon: MediumIcon,
    url: "https://skyopslabs.medium.com",
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