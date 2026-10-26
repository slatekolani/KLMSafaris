import { useEffect, useMemo } from 'react';
import { useText } from '@/lib/utils';

const CODES = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
/** Where most KLM guests come from — listed first so they are one tap away. */
const POPULAR = ['US', 'GB', 'DE', 'CA', 'AU', 'NL', 'FR', 'IT', 'ES', 'CH', 'SE', 'IN', 'ZA', 'KE', 'TZ'];

const flag = (code: string) => String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));

/** Native country picker (best on phones) with flags, popular countries first, and the visitor's own country preselected. */
export default function CountrySelect({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
    const tx = useText();
    const { popular, rest, guess } = useMemo(() => {
        let names: (c: string) => string = (c) => c;
        try {
            const dn = new Intl.DisplayNames(['en'], { type: 'region' });
            names = (c) => dn.of(c) ?? c;
        } catch { /* very old browsers: fall back to codes */ }
        const all = CODES.map((code) => ({ code, name: names(code) }));
        const region = (typeof navigator !== 'undefined' ? navigator.language : '').split('-')[1]?.toUpperCase();
        return {
            popular: POPULAR.map((c) => all.find((x) => x.code === c)!).filter(Boolean),
            rest: [...all].sort((a, b) => a.name.localeCompare(b.name)),
            guess: all.find((x) => x.code === region)?.name,
        };
    }, []);

    useEffect(() => {
        if (!value && guess) onChange(guess);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [guess]);

    return (
        <select className={className} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">{tx('country_select')}</option>
            <optgroup label={tx('country_popular')}>
                {popular.map((c) => <option key={`p-${c.code}`} value={c.name}>{flag(c.code)}  {c.name}</option>)}
            </optgroup>
            <optgroup label={tx('country_all')}>
                {rest.map((c) => <option key={c.code} value={c.name}>{flag(c.code)}  {c.name}</option>)}
            </optgroup>
        </select>
    );
}
