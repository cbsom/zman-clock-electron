import React, { useState } from "react";

type ToggleSwitchType = { defaultChecked?: boolean; text: string; onText: string;offText: string; onChange?: Function };

export default function ToggleSwitch({ defaultChecked, text, onText, offText, onChange }: ToggleSwitchType) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          onClick={() => {
            if (onChange) {
              onChange(!checked);
            }
            setChecked(!checked);
          }}
          checked={checked}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          {"  "}
          {!!checked ? (!!onText? onText : "ON") : (!!offText? offText : "OFF")}
        </span>
      </label>
    </>
  );
}
