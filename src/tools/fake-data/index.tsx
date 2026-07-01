import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Copy, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { useCopy } from "@/hooks/useCopy";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { fadeUp, snap, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  genAddress,
  genCreditCard,
  genCUIL,
  genCUIT,
  genDNI,
  genDOB,
  genEmail,
  genGender,
  genIBAN,
  genIPv4,
  genIPv6,
  genMAC,
  genName,
  genPassword,
  genPhone,
  genProfile,
  genRUT,
  genUA,
  genUsername,
} from "./generators";
import type { Country, FakeProfile } from "./generators";
import type { NationalIdStyle } from "./generators";

type Section =
  | "profile"
  | "national-ids"
  | "person"
  | "contact"
  | "address"
  | "internet"
  | "finance";

type NationalIdType = "rut" | "dni" | "cuit" | "cuil";
type PersonType = "name" | "dob" | "gender";
type ContactType = "email" | "phone" | "username";
type InternetType = "ipv4" | "ipv6" | "mac" | "ua" | "password";
type FinanceType = "card" | "iban";
type ExportValue = string | number | undefined;
type ExportRow = Record<string, ExportValue>;

const DEFAULT_COUNT = 10;

const SECTIONS: { id: Section; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "national-ids", label: "National IDs" },
  { id: "person", label: "Person" },
  { id: "contact", label: "Contact" },
  { id: "address", label: "Address" },
  { id: "internet", label: "Internet" },
  { id: "finance", label: "Finance" },
];

const AR_ID_TYPES: NationalIdType[] = ["dni", "cuit", "cuil"];
const CL_ID_TYPES: NationalIdType[] = ["rut"];
const NATIONAL_ID_STYLE_OPTIONS: {
  value: NationalIdStyle;
  label: string;
}[] = [
  { value: "dotted", label: "Points" },
  { value: "plain", label: "Plain" },
];

function isSection(value: string | null): value is Section {
  return SECTIONS.some((section) => section.id === value);
}

function parseNationalIdType(value: string | undefined): NationalIdType | null {
  return value === "rut" ||
    value === "dni" ||
    value === "cuit" ||
    value === "cuil"
    ? value
    : null;
}

function parseContactType(value: string | undefined): ContactType | null {
  return value === "email" || value === "phone" || value === "username"
    ? value
    : null;
}

function countryForType(value: string | undefined): Country | null {
  if (value === "rut") return "CL";
  if (value === "dni" || value === "cuit" || value === "cuil") return "AR";
  return null;
}

function getNationalIdTypes(country: Country): NationalIdType[] {
  return country === "AR" ? AR_ID_TYPES : CL_ID_TYPES;
}

function resolveNationalIdType(
  country: Country,
  requested: string | undefined,
): NationalIdType {
  const valid = getNationalIdTypes(country);
  const parsed = parseNationalIdType(requested);

  return parsed && valid.includes(parsed) ? parsed : valid[0];
}

function generateNationalIds(
  type: NationalIdType,
  count: number,
  nationalIdStyle: NationalIdStyle,
): string[] {
  return Array.from({ length: count }, () => {
    switch (type) {
      case "dni":
        return genDNI(nationalIdStyle);
      case "cuit":
        return genCUIT();
      case "cuil":
        return genCUIL();
      case "rut":
        return genRUT(nationalIdStyle);
    }
  });
}

function formatProfileText(profile: FakeProfile): string {
  const lines = [
    `=== FAKE PROFILE (${profile.country}) ===`,
    `Name: ${profile.name.full}`,
    `DOB: ${profile.dob}  Gender: ${profile.gender === "M" ? "Masculino" : "Femenino"}`,
    profile.country === "AR"
      ? `DNI: ${profile.id}  CUIT: ${profile.cuit ?? "-"}  CUIL: ${profile.cuil ?? "-"}`
      : `RUT: ${profile.id}`,
    `Email: ${profile.email}`,
    `Phone: ${profile.phone}`,
    `Username: ${profile.username}`,
    `Address: ${profile.address}`,
    `IP: ${profile.ip}`,
    `Password: ${profile.password}`,
    `Card: ${profile.card.number} (${profile.card.brand}, Exp ${profile.card.expiry})`,
  ];

  return lines.join("\n");
}

async function exportRows(
  rows: ExportRow[],
  sheetName: string,
  fileName: string,
): Promise<void> {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

function ProfileSection({
  country,
  nationalIdStyle,
}: {
  country: Country;
  nationalIdStyle: NationalIdStyle;
}) {
  const copy = useCopy();
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [profiles, setProfiles] = useState<FakeProfile[]>(() =>
    Array.from({ length: DEFAULT_COUNT }, () =>
      genProfile(country, nationalIdStyle),
    ),
  );

  const generate = useCallback(() => {
    setProfiles(
      Array.from({ length: count }, () =>
        genProfile(country, nationalIdStyle),
      ),
    );
  }, [count, country, nationalIdStyle]);

  useEffect(() => {
    setProfiles(
      Array.from({ length: count }, () =>
        genProfile(country, nationalIdStyle),
      ),
    );
  }, [country, nationalIdStyle]);

  const copyAll = useCallback(() => {
    copy(
      profiles.map(formatProfileText).join("\n\n"),
      `Copied ${profiles.length} profiles`,
    );
  }, [copy, profiles]);

  const exportXlsx = useCallback(async () => {
    const rows: ExportRow[] = profiles.map((profile) => ({
      Name: profile.name.full,
      DOB: profile.dob,
      Gender: profile.gender === "M" ? "Masculino" : "Femenino",
      ...(profile.country === "AR"
        ? { DNI: profile.id, CUIT: profile.cuit, CUIL: profile.cuil }
        : { RUT: profile.id }),
      Email: profile.email,
      Phone: profile.phone,
      Username: profile.username,
      Address: profile.address,
      IP: profile.ip,
      Password: profile.password,
      "Card Number": profile.card.number,
      "Card Brand": profile.card.brand,
      "Card Expiry": profile.card.expiry,
    }));

    await exportRows(rows, "Profiles", "fake-profiles.xlsx");
  }, [profiles]);

  return (
    <div className="space-y-4">
      <ControlBar
        count={count}
        onCountChange={setCount}
        onGenerate={generate}
        onCopyAll={copyAll}
        onExport={exportXlsx}
        copyAllLabel={`Copy all (${profiles.length})`}
      />

      <motion.ul
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {profiles.map((profile, index) => (
          <motion.li
            key={`${profile.id}-${index}`}
            variants={fadeUp}
            role="button"
            tabIndex={0}
            onClick={() => copy(formatProfileText(profile), "Profile copied")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                copy(formatProfileText(profile), "Profile copied");
              }
            }}
            aria-label={`Copy ${profile.name.full}'s profile`}
            className="group cursor-pointer rounded-lg border border-border bg-surface p-3 text-xs text-fg-muted transition-colors hover:bg-surface-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="truncate text-sm font-medium text-fg">
                  {profile.name.full}
                </div>
                <div>
                  {profile.country === "AR"
                    ? `DNI ${profile.id} · CUIT ${profile.cuit}`
                    : `RUT ${profile.id}`}
                </div>
                <div className="truncate">
                  {profile.email} · {profile.phone}
                </div>
                <div className="truncate text-fg-subtle">
                  {profile.address}
                </div>
              </div>
              <Copy
                size={14}
                className="shrink-0 text-fg-subtle opacity-100 transition-colors group-hover:text-accent sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
              />
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

interface BatchSectionProps {
  items: string[];
  onGenerate: () => void;
  count: number;
  onCountChange: (count: number) => void;
  typeSelector?: ReactNode;
  copyAllLabel?: string;
  exportFn?: () => Promise<void>;
}

function BatchSection({
  items,
  onGenerate,
  count,
  onCountChange,
  typeSelector,
  copyAllLabel,
  exportFn,
}: BatchSectionProps) {
  const copy = useCopy();

  return (
    <div className="space-y-4">
      {typeSelector && <div>{typeSelector}</div>}
      <ControlBar
        count={count}
        onCountChange={onCountChange}
        onGenerate={onGenerate}
        onCopyAll={() =>
          copy(items.join("\n"), copyAllLabel ?? `Copied ${items.length} items`)
        }
        onExport={exportFn}
        copyAllLabel={copyAllLabel ?? `Copy all (${items.length})`}
      />
      <BatchList items={items} />
    </div>
  );
}

function BatchList({ items }: { items: string[] }) {
  const copy = useCopy();

  return (
    <ul className="overflow-hidden rounded-lg border border-border">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          role="button"
          tabIndex={0}
          onClick={() => copy(item)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              copy(item);
            }
          }}
          aria-label={`Copy ${item}`}
          className="group flex cursor-pointer items-center gap-3 border-b border-border bg-surface px-3 py-2 last:border-b-0 hover:bg-surface-2"
        >
          <span className="w-6 shrink-0 text-right text-xs text-fg-subtle">
            {index + 1}
          </span>
          <code className="min-w-0 flex-1 break-all text-sm text-fg">
            {item}
          </code>
          <Copy
            size={14}
            className="shrink-0 text-fg-subtle opacity-100 transition-opacity group-hover:text-accent sm:opacity-0 sm:group-hover:opacity-100"
          />
        </li>
      ))}
    </ul>
  );
}

interface ControlBarProps {
  count: number;
  onCountChange: (count: number) => void;
  onGenerate: () => void;
  onCopyAll: () => void;
  onExport?: () => Promise<void>;
  copyAllLabel?: string;
}

function ControlBar({
  count,
  onCountChange,
  onGenerate,
  onCopyAll,
  onExport,
  copyAllLabel,
}: ControlBarProps) {
  const [exporting, setExporting] = useState(false);
  const id = useId();

  const handleExport = async () => {
    if (!onExport) return;

    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" size="sm" onClick={onGenerate}>
        <RefreshCw size={14} /> Generate
      </Button>

      <div className="inline-flex items-center gap-2 text-xs text-fg-muted">
        <label htmlFor={id}>count</label>
        <input
          id={id}
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(event) =>
            onCountChange(
              Math.min(100, Math.max(1, Number(event.target.value) || 1)),
            )
          }
          className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-fg focus:border-accent/50 focus:outline-none"
        />
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={onCopyAll}
        disabled={count < 1}
      >
        <Copy size={14} /> {copyAllLabel ?? "Copy all"}
      </Button>

      {onExport && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExport}
          disabled={exporting || count < 1}
        >
          <Download size={14} /> {exporting ? "Exporting..." : "Export XLSX"}
        </Button>
      )}
    </div>
  );
}

function NationalIdsSection({
  country,
  initType,
  nationalIdStyle,
}: {
  country: Country;
  initType?: string;
  nationalIdStyle: NationalIdStyle;
}) {
  const initialType = resolveNationalIdType(country, initType);
  const [type, setType] = useState<NationalIdType>(initialType);
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [items, setItems] = useState<string[]>(() =>
    generateNationalIds(initialType, DEFAULT_COUNT, nationalIdStyle),
  );
  const lastInitType = useRef(initType);
  const effectiveType = resolveNationalIdType(country, type);
  const validTypes = getNationalIdTypes(country);

  useEffect(() => {
    let nextType = validTypes.includes(type) ? type : validTypes[0];

    if (initType !== lastInitType.current) {
      lastInitType.current = initType;
      nextType = resolveNationalIdType(country, initType);
    }

    setType(nextType);
    setItems(generateNationalIds(nextType, count, nationalIdStyle));
  }, [country, initType, nationalIdStyle]);

  const regen = useCallback(() => {
    setItems(generateNationalIds(effectiveType, count, nationalIdStyle));
  }, [count, effectiveType, nationalIdStyle]);

  const exportFn = async () => {
    await exportRows(
      items.map((value) => ({ [effectiveType.toUpperCase()]: value })),
      effectiveType.toUpperCase(),
      `fake-${effectiveType}.xlsx`,
    );
  };

  const typeSelector =
    validTypes.length > 1 ? (
      <SegmentedToggle<NationalIdType>
        options={validTypes.map((value) => ({
          value,
          label: value.toUpperCase(),
        }))}
        value={effectiveType}
        onChange={(nextType) => {
          setType(nextType);
          setItems(generateNationalIds(nextType, count, nationalIdStyle));
        }}
        size="sm"
        ariaLabel="ID type"
      />
    ) : null;

  return (
    <BatchSection
      items={items}
      count={count}
      onCountChange={setCount}
      onGenerate={regen}
      typeSelector={typeSelector}
      copyAllLabel={`Copy all ${items.length} ${effectiveType.toUpperCase()}s`}
      exportFn={exportFn}
    />
  );
}

function PersonSection() {
  const [type, setType] = useState<PersonType>("name");
  const [count, setCount] = useState(DEFAULT_COUNT);

  function generate(nextType: PersonType, nextCount: number): string[] {
    return Array.from({ length: nextCount }, () => {
      switch (nextType) {
        case "name":
          return genName().full;
        case "dob":
          return genDOB();
        case "gender":
          return genGender() === "M" ? "Masculino" : "Femenino";
      }
    });
  }

  const [items, setItems] = useState<string[]>(() =>
    generate("name", DEFAULT_COUNT),
  );
  const regen = useCallback(() => {
    setItems(generate(type, count));
  }, [count, type]);

  const exportFn = async () => {
    await exportRows(
      items.map((value) => ({ [type]: value })),
      "Person",
      `fake-${type}.xlsx`,
    );
  };

  return (
    <BatchSection
      items={items}
      count={count}
      onCountChange={setCount}
      onGenerate={regen}
      exportFn={exportFn}
      copyAllLabel={`Copy all ${items.length}`}
      typeSelector={
        <SegmentedToggle<PersonType>
          options={[
            { value: "name", label: "Name" },
            { value: "dob", label: "Date of Birth" },
            { value: "gender", label: "Gender" },
          ]}
          value={type}
          onChange={(nextType) => {
            setType(nextType);
            setItems(generate(nextType, count));
          }}
          size="sm"
          ariaLabel="Person type"
        />
      }
    />
  );
}

function ContactSection({
  country,
  initType,
}: {
  country: Country;
  initType?: string;
}) {
  const defaultType = parseContactType(initType) ?? "email";
  const [type, setType] = useState<ContactType>(defaultType);
  const [count, setCount] = useState(DEFAULT_COUNT);
  const lastInitType = useRef(initType);

  function generate(nextType: ContactType, nextCount: number): string[] {
    return Array.from({ length: nextCount }, () => {
      const name = genName();

      switch (nextType) {
        case "email":
          return genEmail(name);
        case "phone":
          return genPhone(country);
        case "username":
          return genUsername(name);
      }
    });
  }

  const [items, setItems] = useState<string[]>(() =>
    generate(defaultType, DEFAULT_COUNT),
  );
  const regen = useCallback(() => {
    setItems(generate(type, count));
  }, [count, country, type]);

  useEffect(() => {
    let nextType = type;

    if (initType !== lastInitType.current) {
      lastInitType.current = initType;
      nextType = parseContactType(initType) ?? type;
    }

    setType(nextType);
    setItems(generate(nextType, count));
  }, [country, initType]);

  const exportFn = async () => {
    await exportRows(
      items.map((value) => ({ [type]: value })),
      "Contact",
      `fake-${type}.xlsx`,
    );
  };

  return (
    <BatchSection
      items={items}
      count={count}
      onCountChange={setCount}
      onGenerate={regen}
      exportFn={exportFn}
      copyAllLabel={`Copy all ${items.length}`}
      typeSelector={
        <SegmentedToggle<ContactType>
          options={[
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "username", label: "Username" },
          ]}
          value={type}
          onChange={(nextType) => {
            setType(nextType);
            setItems(generate(nextType, count));
          }}
          size="sm"
          ariaLabel="Contact type"
        />
      }
    />
  );
}

function AddressSection({ country }: { country: Country }) {
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [items, setItems] = useState<string[]>(() =>
    Array.from({ length: DEFAULT_COUNT }, () => genAddress(country)),
  );

  const regen = useCallback(() => {
    setItems(Array.from({ length: count }, () => genAddress(country)));
  }, [count, country]);

  useEffect(() => {
    setItems(Array.from({ length: count }, () => genAddress(country)));
  }, [country]);

  const exportFn = async () => {
    await exportRows(
      items.map((value) => ({ Address: value })),
      "Address",
      "fake-addresses.xlsx",
    );
  };

  return (
    <BatchSection
      items={items}
      count={count}
      onCountChange={setCount}
      onGenerate={regen}
      exportFn={exportFn}
      copyAllLabel={`Copy all ${items.length}`}
    />
  );
}

function InternetSection() {
  const [type, setType] = useState<InternetType>("ipv4");
  const [count, setCount] = useState(DEFAULT_COUNT);

  function generate(nextType: InternetType, nextCount: number): string[] {
    return Array.from({ length: nextCount }, () => {
      switch (nextType) {
        case "ipv4":
          return genIPv4();
        case "ipv6":
          return genIPv6();
        case "mac":
          return genMAC();
        case "ua":
          return genUA();
        case "password":
          return genPassword();
      }
    });
  }

  const [items, setItems] = useState<string[]>(() =>
    generate("ipv4", DEFAULT_COUNT),
  );
  const regen = useCallback(() => {
    setItems(generate(type, count));
  }, [count, type]);

  const exportFn = async () => {
    await exportRows(
      items.map((value) => ({ [type]: value })),
      "Internet",
      `fake-${type}.xlsx`,
    );
  };

  return (
    <BatchSection
      items={items}
      count={count}
      onCountChange={setCount}
      onGenerate={regen}
      exportFn={exportFn}
      copyAllLabel={`Copy all ${items.length}`}
      typeSelector={
        <SegmentedToggle<InternetType>
          options={[
            { value: "ipv4", label: "IPv4" },
            { value: "ipv6", label: "IPv6" },
            { value: "mac", label: "MAC" },
            { value: "ua", label: "User Agent" },
            { value: "password", label: "Password" },
          ]}
          value={type}
          onChange={(nextType) => {
            setType(nextType);
            setItems(generate(nextType, count));
          }}
          size="sm"
          ariaLabel="Internet type"
        />
      }
    />
  );
}

function FinanceSection() {
  const [type, setType] = useState<FinanceType>("card");
  const [count, setCount] = useState(DEFAULT_COUNT);

  function generate(nextType: FinanceType, nextCount: number): string[] {
    return Array.from({ length: nextCount }, () => {
      if (nextType === "card") {
        const card = genCreditCard();
        return `${card.number}  ·  ${card.brand}  ·  Exp ${card.expiry}`;
      }

      return genIBAN();
    });
  }

  const [items, setItems] = useState<string[]>(() =>
    generate("card", DEFAULT_COUNT),
  );
  const regen = useCallback(() => {
    setItems(generate(type, count));
  }, [count, type]);

  const exportFn = async () => {
    await exportRows(
      items.map((value) => ({
        [type === "card" ? "Credit Card" : "IBAN"]: value,
      })),
      "Finance",
      `fake-${type}.xlsx`,
    );
  };

  return (
    <BatchSection
      items={items}
      count={count}
      onCountChange={setCount}
      onGenerate={regen}
      exportFn={exportFn}
      copyAllLabel={`Copy all ${items.length}`}
      typeSelector={
        <SegmentedToggle<FinanceType>
          options={[
            { value: "card", label: "Credit Card" },
            { value: "iban", label: "IBAN" },
          ]}
          value={type}
          onChange={(nextType) => {
            setType(nextType);
            setItems(generate(nextType, count));
          }}
          size="sm"
          ariaLabel="Finance type"
        />
      }
    />
  );
}

function TabBar({
  active,
  onChange,
}: {
  active: Section;
  onChange: (section: Section) => void;
}) {
  const layoutId = useId();

  return (
    <div
      role="tablist"
      aria-label="Fake data sections"
      className="flex gap-0.5 overflow-x-auto pb-px"
    >
      {SECTIONS.map(({ id, label }) => {
        const isActive = id === active;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={cn(
              "relative shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive ? "text-accent" : "text-fg-muted hover:text-fg",
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={snap}
                className="absolute inset-0 rounded-md border border-accent/30 bg-accent/15"
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function FakeData() {
  const [searchParams] = useSearchParams();
  const requestedSection = searchParams.get("s");
  const routeSection: Section = isSection(requestedSection)
    ? requestedSection
    : "profile";
  const initType = searchParams.get("t") ?? undefined;
  const [country, setCountry] = useLocalStorage<Country>("fake-data:country", "AR");
  const [storedNationalIdStyle, setNationalIdStyle] =
    useLocalStorage<NationalIdStyle>("fake-data:national-id-style", "dotted");
  const nationalIdStyle: NationalIdStyle =
    storedNationalIdStyle === "plain" ? "plain" : "dotted";
  const [section, setSection] = useState<Section>(routeSection);
  const lastCountryInitType = useRef<string | undefined>(undefined);

  useEffect(() => {
    setSection(routeSection);
  }, [routeSection]);

  useEffect(() => {
    if (initType === lastCountryInitType.current) return;
    lastCountryInitType.current = initType;

    const nextCountry = countryForType(initType);
    if (nextCountry) {
      setCountry(nextCountry);
    }
  }, [initType, setCountry]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs text-fg-subtle">country</span>
          <SegmentedToggle<Country>
            options={[
              { value: "AR", label: "AR" },
              { value: "CL", label: "CL" },
            ]}
            value={country}
            onChange={setCountry}
            size="sm"
            ariaLabel="Country"
          />
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="text-xs text-fg-subtle">id format</span>
          <SegmentedToggle<NationalIdStyle>
            options={NATIONAL_ID_STYLE_OPTIONS}
            value={nationalIdStyle}
            onChange={setNationalIdStyle}
            size="sm"
            ariaLabel="National ID format"
          />
        </div>
      </div>

      <TabBar active={section} onChange={setSection} />

      <div>
        {section === "profile" && (
          <ProfileSection
            country={country}
            nationalIdStyle={nationalIdStyle}
          />
        )}
        {section === "national-ids" && (
          <NationalIdsSection
            country={country}
            initType={initType}
            nationalIdStyle={nationalIdStyle}
          />
        )}
        {section === "person" && <PersonSection />}
        {section === "contact" && (
          <ContactSection country={country} initType={initType} />
        )}
        {section === "address" && <AddressSection country={country} />}
        {section === "internet" && <InternetSection />}
        {section === "finance" && <FinanceSection />}
      </div>
    </div>
  );
}
