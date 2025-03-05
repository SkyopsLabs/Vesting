export function AddressDisplay({ address }: { address: string }) {
  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 py-2 px-4 rounded-md">
      <span className="font-mono text-sm tracking-wider text-white">
        {address}
      </span>
    </div>
  );
}
