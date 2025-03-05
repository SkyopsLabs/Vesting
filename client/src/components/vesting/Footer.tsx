import { Globe } from "lucide-react";

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

          <div className="flex items-center gap-2 text-white/60">
            Powered by
            <img src="/footer.png" alt="Skyops Logo" style={{ height: '2.15rem' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}