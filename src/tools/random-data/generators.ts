// Random data field generators
// Each generator produces a random value for the given field type.

const fNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Jamie', 'Riley',
  'Drew', 'Quinn', 'Avery', 'Blake', 'Cameron', 'Dakota', 'Emerson'];
const lNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Wilson', 'Moore', 'Anderson', 'Thomas', 'Jackson', 'Lee'];
const domains = ['example.com', 'test.org', 'demo.net', 'mail.co', 'acme.io', 'webapp.dev'];
const streets = ['Main St', 'Oak Ave', 'Elm Rd', 'Baker St', 'Park Blvd', 'Cedar Ln', 'Maple Dr'];
const cities = ['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle', 'Boston', 'Portland', 'Denver'];
const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'India', 'Japan'];
const companies = ['Acme Corp', 'TechAce', 'Globex', 'Initech', 'Umbrella Corp', 'Stark Industries', 'WayneEnterprises', 'Hooli'];
const tlds = ['.com', '.org', '.net', '.io', '.dev', '.app', '.co'];
const words = ['quick', 'brown', 'fox', 'jumps', 'lazy', 'dog', 'hello', 'world', 'foo', 'bar', 'baz', 'qux'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rFloat(min: number, max: number, dp = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }

export type FieldType =
  | 'id' | 'firstName' | 'lastName' | 'fullName' | 'email' | 'phone'
  | 'address' | 'city' | 'country' | 'company' | 'boolean'
  | 'integer' | 'float' | 'date' | 'color' | 'url' | 'ipv4'
  | 'uuid' | 'sentence' | 'word' | 'creditCard' | 'latitude' | 'longitude';

export const FIELD_TYPES: { id: FieldType; label: string }[] = [
  { id: 'id',        label: 'UUID / ID' },
  { id: 'uuid',      label: 'UUID v4' },
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName',  label: 'Last Name' },
  { id: 'fullName',  label: 'Full Name' },
  { id: 'email',     label: 'Email Address' },
  { id: 'phone',     label: 'Phone Number' },
  { id: 'address',   label: 'Street Address' },
  { id: 'city',      label: 'City' },
  { id: 'country',   label: 'Country' },
  { id: 'company',   label: 'Company' },
  { id: 'boolean',   label: 'Boolean' },
  { id: 'integer',   label: 'Integer' },
  { id: 'float',     label: 'Float' },
  { id: 'date',      label: 'Date' },
  { id: 'color',     label: 'Hex Color' },
  { id: 'url',       label: 'URL' },
  { id: 'ipv4',      label: 'IPv4 Address' },
  { id: 'sentence',  label: 'Sentence' },
  { id: 'word',      label: 'Word' },
  { id: 'creditCard',label: 'Credit Card (fake)' },
  { id: 'latitude',  label: 'Latitude' },
  { id: 'longitude', label: 'Longitude' },
];

export function generateValue(type: FieldType, config: Record<string, any> = {}): any {
  const f = pick(fNames);
  const l = pick(lNames);

  switch (type) {
    case 'id':
    case 'uuid':
      return crypto.randomUUID();
    case 'firstName': return f;
    case 'lastName':  return l;
    case 'fullName':  return `${f} ${l}`;
    case 'email':     return `${f.toLowerCase()}.${l.toLowerCase()}${rInt(1, 99)}@${pick(domains)}`;
    case 'phone':     return `+1${rInt(200, 999)}${rInt(100, 999)}${rInt(1000, 9999)}`;
    case 'address':   return `${rInt(1, 9999)} ${pick(streets)}`;
    case 'city':      return pick(cities);
    case 'country':   return pick(countries);
    case 'company':   return pick(companies);
    case 'boolean':   return Math.random() > 0.5;
    case 'integer': {
      const min = config.min ?? 0, max = config.max ?? 10000;
      return rInt(min, max);
    }
    case 'float': {
      const min = config.min ?? 0, max = config.max ?? 1000, dp = config.decimals ?? 2;
      return rFloat(min, max, dp);
    }
    case 'date': {
      const start = new Date('2000-01-01').getTime();
      const end = new Date().getTime();
      return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
    }
    case 'color': {
      const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
      return `#${hex}`;
    }
    case 'url': {
      const word = pick(words);
      return `https://${word}${rInt(1, 99)}${pick(tlds)}`;
    }
    case 'ipv4': return `${rInt(1,254)}.${rInt(0,254)}.${rInt(0,254)}.${rInt(1,254)}`;
    case 'sentence': {
      const len = rInt(4, 10);
      const sentence = Array.from({ length: len }, () => pick(words)).join(' ');
      return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    }
    case 'word': return pick(words);
    case 'creditCard': {
      const digits = '4' + Array.from({ length: 15 }, () => rInt(0, 9)).join('');
      return digits.replace(/(.{4})/g, '$1 ').trim();
    }
    case 'latitude':  return rFloat(-90, 90, 6);
    case 'longitude': return rFloat(-180, 180, 6);
    default: return null;
  }
}

export type FieldDef = {
  id: string;
  name: string;
  type: FieldType;
  config: Record<string, any>;
  isNested?: boolean;
  nestedFields?: FieldDef[];
  isArray?: boolean;
  arrayCount?: number;
};

export function generateRecord(fields: FieldDef[]): Record<string, any> {
  const record: Record<string, any> = {};
  for (const field of fields) {
    if (field.isNested && field.nestedFields) {
      if (field.isArray) {
        record[field.name] = Array.from({ length: field.arrayCount ?? 2 }, () =>
          generateRecord(field.nestedFields!)
        );
      } else {
        record[field.name] = generateRecord(field.nestedFields!);
      }
    } else {
      record[field.name] = generateValue(field.type, field.config);
    }
  }
  return record;
}

export function toCSV(data: Record<string, any>[]): string {
  if (!data.length) return '';
  const flatData = data.map(r => flattenObject(r));
  const keys = Object.keys(flatData[0]);
  const header = keys.join(',');
  const rows = flatData.map(r =>
    keys.map(k => {
      const v = r[k];
      const s = v === null || v === undefined ? '' : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

function flattenObject(obj: any, prefix = ''): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const val = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(acc, flattenObject(val, fullKey));
    } else {
      acc[fullKey] = Array.isArray(val) ? JSON.stringify(val) : val;
    }
    return acc;
  }, {} as Record<string, any>);
}

export function toSQL(data: Record<string, any>[], tableName = 'records'): string {
  if (!data.length) return '';
  const flatData = data.map(r => flattenObject(r));
  const keys = Object.keys(flatData[0]);
  const colDefs = keys.map(k => `  \`${k}\` TEXT`).join(',\n');
  const createTable = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n${colDefs}\n);\n\n`;
  const inserts = flatData.map(r => {
    const vals = keys.map(k => {
      const v = r[k];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'boolean') return v ? '1' : '0';
      if (typeof v === 'number') return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    }).join(', ');
    return `INSERT INTO \`${tableName}\` (${keys.map(k=>`\`${k}\``).join(', ')}) VALUES (${vals});`;
  }).join('\n');
  return createTable + inserts;
}
