import Header from '../gifts/components/Header';
import BasketOne from '../gifts/components/BasketOne';
import BasketTwo from '../gifts/components/BasketTwo';
import Lead from '../components/landing/Lead';

export default function gifts() {
  return (
    <div className="min-h-screen">
      <main>
        <Header />
        <BasketOne />
        <BasketTwo />
        <Lead />
      </main>
    </div>
  );
}