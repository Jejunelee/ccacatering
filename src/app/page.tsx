import Hero from '../app/components/landing/Hero';
import Partners from '../app/components/landing/Partners';
import Testimonials from '../app/components/landing/Testimonials';
import Options from '../app/components/landing/Options';
import EventCateringSection from '../app/components/landing/EventCateringSection';
import EventVenuesSection from '../app/components/landing/EventVenuesSection';
import PTPMSection from '../app/components/landing/PTPMSection';
import GiftSection from '../app/components/landing/GiftSection';
import Lead from '../app/components/landing/Lead';

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <Partners />
        <Testimonials />
        <Options />
        <EventCateringSection />
        <EventVenuesSection />
        <PTPMSection />
        <GiftSection />
        <Lead />
      </main>
    </div>
  );
}