import Header from '../venues/components/Header';
import Lead from '../components/landing/Lead';
import Locations from '../venues/components/Locations';

export default function VENUES() {
  return (
    <div className="min-h-screen">
      <main>
        <Header />
        <Locations />
        <Lead />
      </main>
    </div>
  );
}