import Header from '../ptpm/components/Header';
import PartyTraysSection from '../ptpm/components/PartyTrays';
import PackedMealsSection from '../ptpm/components/PackedMeals';
import Lead from '../components/landing/Lead';

export default function PTPM() {
  return (
    <div className="min-h-screen">
      <main>
        <Header />
        <PartyTraysSection />
        <PackedMealsSection />
        <Lead />
      </main>
    </div>
  );
}