import {useState} from 'react';
import {Location, Locations} from "@/jcal-zmanim";
import CloseButton from "@/components/CloseButton";

type locationChooserProps = { location: Location, eng: boolean, onChangeLocation: Function, onClose: Function }
export default function LocationChooser({location, eng, onChangeLocation, onClose}: locationChooserProps) {
    const [list, setList] = useState(Locations);

    function changeLocation(loc: Location) {
        if (loc.Name !== location.Name) {
            onChangeLocation(loc);
        }
    }

    return (
        <main>
            <section className="">
                <article className='flex justify-between flex-row align-tex-top p-2'>
                    <header className="p-4 font-bold text-lg">{eng ? 'Locations' : 'מקומות'}</header>
                    <CloseButton onClick={() => onClose()}/>
                </article>
            </section>
            <section className="h-full">
                <input type="text" className='p-3 rounded' placeholder={eng ? 'Filter' : 'חפש'} onChange={e =>
                    setList(Locations.filter(l =>
                        (`${l.Name} ${(!!l.NameHebrew) ? '  ' + l.NameHebrew : ''}`).toLowerCase().includes(e.target.value.toLowerCase())))}/>
                {list.map(loc =>
                    <div className="px-4 py-1 text-gray-400 text-left  cursor-pointer" key={loc.Name}
                         onClick={() => changeLocation(loc)}>
                        {eng ? loc.Name : loc.NameHebrew || loc.Name}
                    </div>)}
            </section>
        </main>
    );
}
