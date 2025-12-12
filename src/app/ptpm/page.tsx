import Header from '../ptpm/components/Header';
import PartyTrays from '../ptpm/components/PartyTrays';
import PackedMeals from '../ptpm/components/PackedMeals';
import Lead from '../components/landing/Lead';

export default function PTPM() {
  return (
    <div className="min-h-screen">
      <main>
        <Header />
        <PartyTrays />
        <PackedMeals />
        <Lead />
      </main>
    </div>
  );
}