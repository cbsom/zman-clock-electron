import {Location, Locations} from "@/jcal-zmanim";

type locationChooserProps = { location: Location, changeLocation: Function }
export default function LocationChooser({location, changeLocation}: locationChooserProps) {

    function onChangeLocation(loc: Location) {
        if (loc.Name !== location.Name) {
            changeLocation(loc);
        }
    }
    return (
        <main
            className="">
            <section className="">
                <article>
                    <header className="p-4 font-bold text-lg">Locations</header>
                </article>
            </section>
            <section
                className="h-full"
            >
                {Locations.map(loc =>
                    <div className="px-4 py-1 text-gray-400  cursor-pointer" key={loc.Name}
                         onClick={() => onChangeLocation(loc)}>
                        {`${loc.Name}${!!loc.NameHebrew + ' ' + loc.NameHebrew}`}
                    </div>)}
            </section>
        </main>
    );
}
