'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, TextInput, Select, Text, Group, RangeSlider,
  Stack, NumberInput, Combobox, InputBase, useCombobox,
} from '@mantine/core';
import { IconSearch, IconMapPin, IconBriefcase, IconCurrencyRupee } from '@tabler/icons-react';
import { useSearch } from '@/context/SearchContext';

const LOCATIONS = ['Chennai', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Remote'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

// ── Searchable location combobox ──────────────────────────────────────────────
function LocationCombobox({
  value,
  onChange,
  size = 'md',
}: {
  value: string;
  onChange: (v: string) => void;
  size?: 'sm' | 'md';
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [search, setSearch] = useState(value);

  // Keep input in sync when context resets
  useEffect(() => { setSearch(value); }, [value]);

  const filtered = search.trim() === ''
    ? LOCATIONS
    : LOCATIONS.filter(l => l.toLowerCase().includes(search.toLowerCase()));

  const options = filtered.map(l => (
    <Combobox.Option value={l} key={l}>{l}</Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(v) => {
        onChange(v);
        setSearch(v);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          leftSection={<IconMapPin size={size === 'sm' ? 16 : 18} color="#666" />}
          rightSection={
            value ? (
              <Combobox.ClearButton
                onClear={() => { onChange(''); setSearch(''); }}
              />
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionPointerEvents={value ? 'all' : 'none'}
          placeholder="Location"
          size={size}
          variant="unstyled"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value); // allow custom text too
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0
            ? options
            : <Combobox.Empty>No match — will use "{search}"</Combobox.Empty>
          }
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

// ── Salary range section ──────────────────────────────────────────────────────
function SalarySection({
  salaryRange,
  onChange,
  mobile = false,
}: {
  salaryRange: [number, number];
  onChange: (v: [number, number]) => void;
  mobile?: boolean;
}) {
  return (
    <Box>
      <Text size="xs" c="dimmed" mb={6}>
        Salary (LPA)
      </Text>

      {/* Min / Max number inputs */}
      <Group gap="xs" mb={10} wrap="nowrap">
        <NumberInput
          size="xs"
          placeholder="Min"
          min={0}
          max={salaryRange[1]}
          step={1}
          value={salaryRange[0]}
          onChange={(v) => onChange([Number(v) || 0, salaryRange[1]])}
          leftSection={<IconCurrencyRupee size={11} />}
          styles={{
            root: { flex: 1 },
            input: { fontSize: 11, height: 28, minHeight: 28, paddingLeft: 22 },
            section: { width: 22 },
          }}
          hideControls
        />
        <Text size="xs" c="dimmed">–</Text>
        <NumberInput
          size="xs"
          placeholder="Max"
          min={salaryRange[0]}
          max={500}
          step={1}
          value={salaryRange[1] === 50 ? '' : salaryRange[1]}
          onChange={(v) => onChange([salaryRange[0], v === '' || v === undefined ? 50 : Number(v)])}
          leftSection={<IconCurrencyRupee size={11} />}
          styles={{
            root: { flex: 1 },
            input: { fontSize: 11, height: 28, minHeight: 28, paddingLeft: 22 },
            section: { width: 22 },
          }}
          hideControls
        />
      </Group>

      {/* Slider */}
      <Box px={4}>
       <RangeSlider
          min={0}
          max={50}
          step={1}
          minRange={0}
          value={salaryRange}
          onChange={onChange}
          label={(v) => `₹${v} LPA`}
          styles={{
            thumb: { borderColor: '#7B3FF2', backgroundColor: 'white', width: 14, height: 14 },
            bar: { backgroundColor: '#7B3FF2', height: 2 },
            track: { height: 2 },
          }}
        />
      </Box>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SearchFilters() {
  const [mounted, setMounted] = useState(false);
  const { filters, setFilters } = useSearch();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <Box
      style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #eee',
        marginBottom: '30px',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* ── Desktop ── */}
      <Group align="center" gap="md" visibleFrom="md">

        <TextInput
          placeholder="Search By Job Title, Role"
          leftSection={<IconSearch size={18} color="#666" />}
          style={{ flex: 2 }}
          size="md"
          variant="unstyled"
          value={filters.searchText}
          onChange={(e) => setFilters(f => ({ ...f, searchText: e.target.value }))}
        />

        <Text style={{ color: '#ddd', fontSize: '28px', fontWeight: 200, paddingTop: 4 }}>|</Text>

        <Box style={{ flex: 1 }}>
          <LocationCombobox
            value={filters.location}
            onChange={(v) => setFilters(f => ({ ...f, location: v }))}
            size="md"
          />
        </Box>

        <Text style={{ color: '#ddd', fontSize: '28px', fontWeight: 200, paddingTop: 4 }}>|</Text>

        <Select
          placeholder="Job Type"
          leftSection={<IconBriefcase size={18} color="#666" />}
          data={JOB_TYPES}
          style={{ flex: 1 }}
          size="md"
          variant="unstyled"
          value={filters.jobType || null}
          onChange={(v) => setFilters(f => ({ ...f, jobType: v || '' }))}
          clearable
        />

        <Text style={{ color: '#ddd', fontSize: '28px', fontWeight: 200, paddingTop: 4 }}>|</Text>

        <Box style={{ flex: 1.2 }}>
          <SalarySection
            salaryRange={filters.salaryRange}
            onChange={(v) => setFilters(f => ({ ...f, salaryRange: v }))}
          />
        </Box>
      </Group>

      {/* ── Mobile ── */}
      <Stack gap="sm" hiddenFrom="md">
        <TextInput
          placeholder="Search By Job Title, Role"
          leftSection={<IconSearch size={16} color="#666" />}
          size="sm"
          value={filters.searchText}
          onChange={(e) => setFilters(f => ({ ...f, searchText: e.target.value }))}
        />

        <Group grow gap="sm">
          <LocationCombobox
            value={filters.location}
            onChange={(v) => setFilters(f => ({ ...f, location: v }))}
            size="sm"
          />
          <Select
            placeholder="Job Type"
            leftSection={<IconBriefcase size={16} color="#666" />}
            data={JOB_TYPES}
            size="sm"
            value={filters.jobType || null}
            onChange={(v) => setFilters(f => ({ ...f, jobType: v || '' }))}
            clearable
          />
        </Group>

        <Box px="xs">
          <SalarySection
            salaryRange={filters.salaryRange}
            onChange={(v) => setFilters(f => ({ ...f, salaryRange: v }))}
            mobile
          />
        </Box>
      </Stack>
    </Box>
  );
}