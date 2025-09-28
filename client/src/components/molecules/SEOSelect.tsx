import React from 'react';
import { SEO_PRESETS } from '../../hooks/useSEO';

type SEOPresetKey = keyof typeof SEO_PRESETS;

interface SEOSelectProps {
    value?: SEOPresetKey | '';
    onChange?: (key: SEOPresetKey | '') => void;
    id?: string;
    className?: string;
}

const SEOSelect: React.FC<SEOSelectProps> = ({
    value,
    onChange,
    id = 'seo_preset',
    className,
}) => {
    const keys = Object.keys(SEO_PRESETS) as SEOPresetKey[];

    return (
        <div className={className}>
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700"
            >
                SEO Preset
            </label>
            <select
                id={id}
                name={id}
                value={value || ''}
                onChange={(e) =>
                    onChange?.((e.target.value as SEOPresetKey) || '')
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
                <option value="">— Select preset —</option>
                {keys.map((key) => (
                    <option key={key} value={key}>
                        {key}
                    </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
                Choose a SEO preset to quickly apply page metadata.
            </p>
        </div>
    );
};

export default SEOSelect;
