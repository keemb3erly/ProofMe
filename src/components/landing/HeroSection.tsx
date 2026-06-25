export default function HeroSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <span className="mb-4 rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
          Community Powered Scam Intelligence
        </span>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight text-[#004D61]">
          Verify Trust Before You Transact.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          Search phone numbers, businesses, bank accounts, usernames, and
          online sellers before sending money or sharing sensitive information.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="rounded-lg bg-[#004D61] px-6 py-3 font-semibold text-white transition hover:opacity-90">
            Verify an Entity
          </button>

          <button className="rounded-lg border border-[#004D61] px-6 py-3 font-semibold text-[#004D61] transition hover:bg-gray-50">
            Report a Scam
          </button>
        </div>
      </div>
    </section>
  );
}
