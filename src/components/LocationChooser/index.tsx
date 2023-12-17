import {Location, Locations} from "@/jcal-zmanim";

type locationChooserProps = { location: Location, onChangeLocation: Function, onClose: Function }
export default function LocationChooser({location, onChangeLocation, onClose}: locationChooserProps) {

    function changeLocation(loc: Location) {
        if (loc.Name !== location.Name) {
            onChangeLocation(loc);
        }
    }

    return (
        <main
            className="">
            <section className="">
                <article className='flex justify-between flex-row align-bottom p-2'>
                    <header className="p-4 font-bold text-lg">Locations</header>
                    <button type="button"
                            className="w-5 h-8 bg-amber-200 rounded-md inline-flex items-center justify-center text-amber-500 hover:text-amber-700 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onClick={() => onClose()}>
                        x
                    </button>
                </article>
            </section>
            <section
                className="h-full"
            >
                {Locations.map(loc =>
                    <div className="px-4 py-1 text-gray-400  cursor-pointer" key={loc.Name}
                         onClick={() => changeLocation(loc)}>
                        {`${loc.Name} ${(!!loc.NameHebrew)? '  ' + loc.NameHebrew:''}`}
                    </div>)}
            </section>
        </main>
    );
}
