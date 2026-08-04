'use client';

import React, { useEffect, useRef, useState } from 'react';

import {
    TextInput,
    Textarea,
    NumberInput,
    Select,
    Button,
    Stack,
    Group,
    Modal,
    Loader,
    Text,
    ActionIcon,
} from '@mantine/core';

import { notifications } from '@mantine/notifications';
import { useLoader } from '@/context/LoaderContext';

import { api } from '@/services/api';

import {
    IconArrowDown,
    IconArrowRight,
    IconChevronLeft,
    IconChevronRight,
    IconCalendar,
    IconX,
    IconUpload,
} from '@tabler/icons-react';

// Shape of an existing job passed in for editing
interface InitialJobData {
    id: number;
    jobTitle: string;
    companyName: string;
    companyLogoUrl?: string;   // existing URL (not a File)
    location: string;
    jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
    experience: string;
    salaryMin: number;
    salaryMax: number;
    jobDescription: string;
    requirements: string;
    responsibilities: string;
    applicationDeadline?: string | Date | null;
    status?: 'draft' | 'published';
}

interface CreateJobFormProps {
    onJobCreated: () => void | Promise<void>;
    opened: boolean;
    onClose: () => void;
    /** Pass to switch into update mode */
    mode?: 'create' | 'update';
    initialData?: InitialJobData;
}

type ExperiencePreset = 'Fresher' | '1 year' | '2 years' | '3 years' | '5 years' | '7 years' | '10+ years' | 'custom';

interface FormData {
    jobTitle: string;
    companyName: string;
    companyLogo: File | null;
    location: string;
    jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
    experiencePreset: ExperiencePreset | '';
    experienceCustom: string;
    salaryMin: number;
    salaryMax: number;
    jobDescription: string;
    requirements: string;
    responsibilities: string;
    applicationDeadline: Date | null;
    status: 'draft' | 'published';
}

// ─── Compact Custom Date Picker ───────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CompactDatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    label: string;
    required?: boolean;
    error?: string;
}

function CompactDatePicker({ value, onChange, label, required, error }: CompactDatePickerProps) {
    const today = new Date();
    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    const handleDayClick = (day: number) => {
        onChange(new Date(viewYear, viewMonth, day));
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    const prevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const prevYear = (e: React.MouseEvent) => { e.stopPropagation(); setViewYear(y => y - 1); };
    const nextYear = (e: React.MouseEvent) => { e.stopPropagation(); setViewYear(y => y + 1); };

    const displayValue = value
        ? `${value.getDate()} ${MONTHS[value.getMonth()]} ${value.getFullYear()}`
        : '';

    const blanks = Array(firstDayOfWeek).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const allCells = [...blanks, ...days];

    const isToday = (day: number) =>
        day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

    const isSelected = (day: number) =>
        !!value &&
        day === value.getDate() &&
        viewMonth === value.getMonth() &&
        viewYear === value.getFullYear();

    const isPast = (day: number) => {
        const d = new Date(viewYear, viewMonth, day);
        d.setHours(0, 0, 0, 0);
        const t = new Date(); t.setHours(0, 0, 0, 0);
        return d < t;
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <Text size="sm" fw={500} mb={4} component="label">
                {label}
                {required && <span style={{ color: '#fa5252', marginLeft: 2 }}>*</span>}
            </Text>

            <div
                role="button"
                tabIndex={0}
                onClick={() => {
                    if (!open && containerRef.current) {
                        const rect = containerRef.current.getBoundingClientRect();
                        setOpenUpward(window.innerHeight - rect.bottom < 320);
                    }
                    setOpen(o => !o);
                }}
                onKeyDown={(e) => e.key === 'Enter' && setOpen(o => !o)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `1px solid ${open ? '#7B3FF2' : '#dee2e6'}`,
                    borderRadius: '8px',
                    padding: '9px 14px',
                    cursor: 'pointer',
                    background: '#fff',
                    fontSize: '14px',
                    color: displayValue ? '#212529' : '#adb5bd',
                    userSelect: 'none',
                    boxShadow: open ? '0 0 0 2px #e9d8ff' : 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    outline: 'none',
                    height: '42px',
                }}
            >
                <span style={{ fontSize: '14px' }}>{displayValue || 'Select deadline'}</span>
                <Group gap={6} wrap="nowrap">
                    {value && (
                        <span
                            role="button"
                            onClick={handleClear}
                            style={{
                                color: '#adb5bd',
                                fontSize: 18,
                                lineHeight: 1,
                                padding: '0 2px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            ×
                        </span>
                    )}
                    <IconCalendar size={16} color={open ? '#7B3FF2' : '#adb5bd'} />
                </Group>
            </div>
            {error && (
                <Text size="xs" c="red" mt={4}>{error}</Text>
            )}

            {open && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        ...(openUpward
                            ? { bottom: 'calc(100% + 6px)' }
                            : { top: 'calc(100% + 6px)' }),
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        background: '#fff',
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        padding: '14px',
                        maxWidth: '300px',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                        <button type="button" onClick={prevYear} style={{ width: 26, height: 26, border: 'none', borderRadius: '50%', background: '#f3edff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
                            <IconChevronLeft size={12} color="#7B3FF2" />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: 14, minWidth: 40, textAlign: 'center' }}>{viewYear}</span>
                        <button type="button" onClick={nextYear} style={{ width: 26, height: 26, border: 'none', borderRadius: '50%', background: '#f3edff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
                            <IconChevronRight size={12} color="#7B3FF2" />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8f4ff', borderRadius: 8, padding: '6px 10px', marginBottom: 12 }}>
                        <button type="button" onClick={prevMonth} style={{ width: 26, height: 26, border: 'none', borderRadius: '50%', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
                            <IconChevronLeft size={14} color="#7B3FF2" />
                        </button>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#6741d9' }}>{MONTH_FULL[viewMonth]}</span>
                        <button type="button" onClick={nextMonth} style={{ width: 26, height: 26, border: 'none', borderRadius: '50%', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
                            <IconChevronRight size={14} color="#7B3FF2" />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#adb5bd', fontWeight: 600, padding: '2px 0' }}>{d}</div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                        {allCells.map((cell, idx) =>
                            cell === null ? (
                                <div key={`blank-${idx}`} />
                            ) : (
                                <button
                                    key={cell}
                                    type="button"
                                    onClick={() => !isPast(cell) && handleDayClick(cell)}
                                    style={{
                                        width: '100%', aspectRatio: '1', border: 'none', borderRadius: '6px',
                                        cursor: isPast(cell) ? 'not-allowed' : 'pointer', fontSize: 11,
                                        fontWeight: isSelected(cell) ? 700 : 400,
                                        background: isSelected(cell) ? '#7B3FF2' : isToday(cell) ? '#f3edff' : 'transparent',
                                        color: isSelected(cell) ? '#fff' : isPast(cell) ? '#ced4da' : isToday(cell) ? '#7B3FF2' : '#212529',
                                        transition: 'background 0.12s, color 0.12s', padding: 0, outline: 'none', lineHeight: 1,
                                    }}
                                    onMouseEnter={e => { if (!isSelected(cell) && !isPast(cell)) { e.currentTarget.style.background = '#f3edff'; e.currentTarget.style.color = '#7B3FF2'; } }}
                                    onMouseLeave={e => { if (!isSelected(cell)) { e.currentTarget.style.background = isToday(cell) ? '#f3edff' : 'transparent'; e.currentTarget.style.color = isPast(cell) ? '#ced4da' : isToday(cell) ? '#7B3FF2' : '#212529'; } }}
                                >
                                    {cell}
                                </button>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Company Logo Uploader ────────────────────────────────────────────────────

const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

interface LogoUploaderProps {
    value: File | null;
    onChange: (file: File | null) => void;
}

function LogoUploader({ value, onChange }: LogoUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!value) { setPreview(null); return; }
        const url = URL.createObjectURL(value);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [value]);

    const handleFile = (file: File) => {
        setError(null);
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('SVG, PNG or WebP only');
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError('Max 5 MB');
            return;
        }
        onChange(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setError(null);
    };

    return (
        <div>
            <Text size="sm" fw={500} mb={4} component="label">
                Company Logo
            </Text>

            <input
                ref={inputRef}
                type="file"
                accept=".svg,.png,.webp,image/svg+xml,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleInputChange}
            />

            {/* Upload zone / preview */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => !preview && inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && !preview && inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{
                    height: '42px',
                    border: `1px dashed ${error ? '#fa5252' : preview ? '#7B3FF2' : '#dee2e6'}`,
                    borderRadius: '8px',
                    background: preview ? '#faf8ff' : '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: preview ? 'space-between' : 'center',
                    gap: 8,
                    padding: '0 10px',
                    cursor: preview ? 'default' : 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                }}
            >
                {preview ? (
                    <>
                        {/* Thumbnail */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <img
                                src={preview}
                                alt="Logo preview"
                                style={{
                                    width: 26,
                                    height: 26,
                                    objectFit: 'contain',
                                    borderRadius: 4,
                                    border: '1px solid #e9ecef',
                                    flexShrink: 0,
                                    background: '#fff',
                                }}
                            />
                            <Text
                                size="xs"
                                c="violet.7"
                                fw={500}
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 90,
                                }}
                            >
                                {value?.name}
                            </Text>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                                style={{
                                    fontSize: 10,
                                    color: '#7B3FF2',
                                    background: '#f3edff',
                                    border: 'none',
                                    borderRadius: 4,
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    lineHeight: 1.6,
                                }}
                            >
                                Change
                            </button>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="xs"
                                radius="xl"
                                onClick={handleClear}
                                aria-label="Remove logo"
                            >
                                <IconX size={11} />
                            </ActionIcon>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <IconUpload size={13} color="#adb5bd" />
                        <Text size="xs" c="dimmed">Upload logo</Text>
                        <Text size="xs" c="dimmed" style={{ opacity: 0.6 }}>· SVG, PNG, WebP · 5 MB</Text>
                    </div>
                )}
            </div>

            {error && (
                <Text size="xs" c="red" mt={4}>{error}</Text>
            )}
        </div>
    );
}

// ─── Experience Picker ────────────────────────────────────────────────────────

const EXPERIENCE_PRESETS: { value: ExperiencePreset; label: string }[] = [
    { value: 'Fresher', label: 'Fresher (0 yrs)' },
    { value: '1 year', label: '1 year' },
    { value: '2 years', label: '2 years' },
    { value: '3 years', label: '3 years' },
    { value: '5 years', label: '5 years' },
    { value: '7 years', label: '7 years' },
    { value: '10+ years', label: '10+ years' },
    { value: 'custom', label: 'Custom…' },
];

interface ExperiencePickerProps {
    preset: ExperiencePreset | '';
    custom: string;
    onPresetChange: (v: ExperiencePreset | '') => void;
    onCustomChange: (v: string) => void;
    required?: boolean;
    error?: string;
}

function ExperiencePicker({ preset, custom, onPresetChange, onCustomChange, required, error }: ExperiencePickerProps) {
    const isCustom = preset === 'custom';

    const handleReset = () => {
        onPresetChange('');
        onCustomChange('');
    };

    return (
        <div>
            <Text size="sm" fw={500} mb={4} component="label">
                Experience Required
                {required && <span style={{ color: '#fa5252', marginLeft: 2 }}>*</span>}
            </Text>

            {isCustom ? (
                /* Custom free-text input — shown when "Custom…" is picked */
                <TextInput
                    key="exp-custom"
                    radius="md"
                    size="md"
                    autoFocus
                    placeholder="e.g. 4 years, 18 months"
                    value={custom}
                    onChange={(e) => onCustomChange(e.target.value)}
                    rightSection={
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onMouseDown={(e) => {
                                // preventDefault keeps the input from losing focus
                                // before the state update, preventing a double-render flicker
                                e.preventDefault();
                                handleReset();
                            }}
                            aria-label="Back to presets"
                        >
                            <IconX size={13} />
                        </ActionIcon>
                    }
                />
            ) : (
                /* Preset dropdown — key forces clean remount after reset */
                <Select
                    key="exp-select"
                    placeholder="Select experience"
                    data={EXPERIENCE_PRESETS}
                    value={preset || null}
                    error={error}
                    onChange={(v) => onPresetChange((v as ExperiencePreset) ?? '')}
                    radius="md"
                    size="md"
                    comboboxProps={{ withinPortal: true }}
                />
            )}
        </div>
    );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function CreateJobForm({
    onJobCreated,
    opened,
    onClose,
    mode = 'create',
    initialData,
}: CreateJobFormProps) {
    const isUpdate = mode === 'update';
    const { showLoader, hideLoader } = useLoader();

    // Derive experience preset/custom from a raw experience string
    const PRESET_VALUES: ExperiencePreset[] = [
        'Fresher', '1 year', '2 years', '3 years', '5 years', '7 years', '10+ years',
    ];
    const deriveExperience = (exp?: string): { preset: ExperiencePreset | ''; custom: string } => {
        if (!exp) return { preset: '', custom: '' };
        if (PRESET_VALUES.includes(exp as ExperiencePreset))
            return { preset: exp as ExperiencePreset, custom: '' };
        return { preset: 'custom', custom: exp };
    };

    const knownLocations = ['Chennai', 'Mumbai', 'Bengaluru', 'Hyderabad'];

    const buildInitialForm = (): FormData => {
        if (!initialData) return {
            jobTitle: '', companyName: '', companyLogo: null, location: '',
            jobType: 'Full-time', experiencePreset: '', experienceCustom: '',
            salaryMin: 0, salaryMax: 0, jobDescription: '', requirements: '',
            responsibilities: '', applicationDeadline: null, status: 'draft',
        };
        const { preset, custom } = deriveExperience(initialData.experience);
        return {
            jobTitle: initialData.jobTitle,
            companyName: initialData.companyName,
            companyLogo: null,                      // File cannot be pre-filled; existing URL shown separately
            location: initialData.location,
            jobType: initialData.jobType,
            experiencePreset: preset,
            experienceCustom: custom,
            salaryMin: initialData.salaryMin,
            salaryMax: initialData.salaryMax,
            jobDescription: initialData.jobDescription,
            requirements: initialData.requirements,
            responsibilities: initialData.responsibilities,
            applicationDeadline: initialData.applicationDeadline
                ? new Date(initialData.applicationDeadline)
                : null,
            status: initialData.status ?? 'draft',
        };
    };

    const [mounted, setMounted] = useState(false);
    const [showCustomLocation, setShowCustomLocation] = useState(
        () => !!initialData?.location && !knownLocations.includes(initialData.location)
    );
    const [formData, setFormData] = React.useState<FormData>(buildInitialForm);
    const [isLoading, setIsLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});


    // Re-seed the form whenever initialData changes (e.g. opening a different card)
    useEffect(() => {
        setFormData(buildInitialForm());
        setErrors({});
        setShowCustomLocation(
            !!initialData?.location && !knownLocations.includes(initialData.location)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData?.id, opened]);

    const locationOptions = [
        { value: 'Chennai', label: 'Chennai' },
        { value: 'Mumbai', label: 'Mumbai' },
        { value: 'Bengaluru', label: 'Bengaluru' },
        { value: 'Hyderabad', label: 'Hyderabad' },
        { value: 'other', label: 'Other Location' },
    ];

    // Derive the final experience string to send to the API
    const resolvedExperience =
        formData.experiencePreset === 'custom'
            ? formData.experienceCustom.trim()
            : formData.experiencePreset;

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        showLoader(isUpdate ? 'update' : 'publish');

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                experience: resolvedExperience,
                status: 'published' as const,
                applicationDeadline: formData.applicationDeadline || new Date(),
            };

            const result = isUpdate && initialData
                ? await api.updateJob(initialData.id, payload)
                : await api.createJob(payload);

            if (result.success) {
                onClose();
                await onJobCreated();
                notifications.show({
                    title: isUpdate ? 'Job Updated!' : 'Job Published!',
                    message: isUpdate
                        ? 'The job opening has been updated.'
                        : 'Your job opening is now live.',
                    color: 'green',
                    position: 'bottom-right',
                    autoClose: 4000,
                });
            } else {
                notifications.show({
                    title: isUpdate ? 'Update Failed' : 'Publish Failed',
                    message: 'Something went wrong. Please try again.',
                    color: 'red',
                    position: 'bottom-right',
                    autoClose: 4000,
                });
            }
        } catch (error) {
            console.error('Error submitting job:', error);
            notifications.show({
                title: isUpdate ? 'Update Failed' : 'Publish Failed',
                message: error instanceof Error ? error.message : 'An unexpected error occurred.',
                color: 'red',
                position: 'bottom-right',
                autoClose: 4000,
            });
        } finally {
            hideLoader();
            setIsLoading(false);
        }
    };

    const handleDraftSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!validate()) return;
        showLoader('draft');
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                experience: resolvedExperience,
                status: 'draft' as const,
                applicationDeadline: formData.applicationDeadline || new Date(),
            };

            const result = isUpdate && initialData
                ? await api.updateJob(initialData.id, payload)
                : await api.createJob(payload);

            if (result.success) {
                onClose();
                await onJobCreated();
                notifications.show({
                    title: isUpdate ? 'Draft Updated' : 'Draft Saved',
                    message: isUpdate
                        ? 'Changes saved to draft.'
                        : 'Job saved to drafts successfully.',
                    color: 'violet',
                    position: 'bottom-right',
                    autoClose: 4000,
                });
            } else {
                notifications.show({
                    title: 'Save Failed',
                    message: 'Could not save draft. Please try again.',
                    color: 'red',
                    position: 'bottom-right',
                    autoClose: 4000,
                });
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            notifications.show({
                title: 'Save Failed',
                message: error instanceof Error ? error.message : 'An unexpected error occurred.',
                color: 'red',
                position: 'bottom-right',
                autoClose: 4000,
            });
        } finally {
            hideLoader();
            setIsLoading(false);
        }
    };


    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.jobTitle.trim())
            newErrors.jobTitle = 'Job title is required';

        if (!formData.companyName.trim())
            newErrors.companyName = 'Company name is required';

        if (!formData.location.trim())
            newErrors.location = 'Location is required';

        if (!formData.jobType)
            newErrors.jobType = 'Job type is required';

        if (!resolvedExperience)
            newErrors.experience = 'Experience is required';

        if (formData.experiencePreset === 'custom' && !formData.experienceCustom.trim())
            newErrors.experience = 'Please enter your custom experience';

        if (!formData.salaryMin || formData.salaryMin <= 0)
            newErrors.salaryMin = 'Salary min is required';

        if (!formData.salaryMax || formData.salaryMax <= 0)
            newErrors.salaryMax = 'Salary max is required';

        if (formData.salaryMin > 0 && formData.salaryMax > 0 && formData.salaryMin >= formData.salaryMax)
            newErrors.salaryMax = 'Salary max must be greater than min';

        if (!formData.applicationDeadline)
            newErrors.applicationDeadline = 'Application deadline is required';

        if (!formData.jobDescription.trim())
            newErrors.jobDescription = 'Job description is required';

        if (!formData.requirements.trim())
            newErrors.requirements = 'Requirements are required';

        if (!formData.responsibilities.trim())
            newErrors.responsibilities = 'Responsibilities are required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleLocationChange = (value: string | null) => {
        if (value === 'other') {
            setShowCustomLocation(true);
            setFormData({ ...formData, location: '' });
        } else {
            setShowCustomLocation(false);
            setFormData({ ...formData, location: value || '' });
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size={1000}
            centered
            radius="md"
            withCloseButton={false}
            styles={{
                content: {
                    borderRadius: '16px',
                    maxHeight: '92dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',   // needed for the loading overlay
                },
                body: {
                    padding: 0,
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                },
                header: { display: 'none' },
                inner: { padding: '16px 24px' },
            }}
        >
            {/* ── Sticky title bar ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid #f1f3f5',
                background: '#fff',
                borderRadius: '16px 16px 0 0',
                flexShrink: 0,
            }}>
                <div style={{ width: 32 }} />
                <Text fw={800} size="xl" c="violet.6" style={{ letterSpacing: '-0.01em' }}>
                    {isUpdate ? 'Update Job Opening' : 'Create Job Opening'}
                </Text>
                <ActionIcon variant="subtle" color="gray" size="md" radius="xl" onClick={onClose} aria-label="Close">
                    <IconX size={18} />
                </ActionIcon>
            </div>

            {/* ── Publishing overlay — sits over the form while submitting ── */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                }}>
                    <Loader size="xl" color="violet" type="oval" />
                    <Text fw={600} size="md" c="violet.6">
                        {isUpdate ? 'Updating job opening…' : 'Publishing your job…'}
                    </Text>
                    <Text size="sm" c="dimmed">This may take a few seconds</Text>
                </div>
            )}

            {/* ── Scrollable form body ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(12px, 3vw, 24px)' }}>
                <form onSubmit={handleSubmit}>
                    {false ? null : (
                        <Stack gap="md">

                            {/* ── Row 1: Job Title · Company Name · Company Logo ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'flex-start' }}>                                <TextInput
                                radius="md" size="md" required
                                label="Job Title"
                                placeholder="Full Stack Developer"
                                value={formData.jobTitle}
                                error={errors.jobTitle}
                                onChange={(e) => { setFormData({ ...formData, jobTitle: e.target.value }); setErrors(p => ({ ...p, jobTitle: '' })); }}
                            />
                                <TextInput
                                    radius="md" size="md" required
                                    label="Company Name"
                                    placeholder="Amazon, Swiggy"
                                    value={formData.companyName}
                                    error={errors.companyName}
                                    onChange={(e) => { setFormData({ ...formData, companyName: e.target.value }); setErrors(p => ({ ...p, companyName: '' })); }}
                                />
                                <div>
                                    <LogoUploader
                                        value={formData.companyLogo}
                                        onChange={(file) => setFormData({ ...formData, companyLogo: file })}
                                    />
                                    {isUpdate && initialData?.companyLogoUrl && !formData.companyLogo && (
                                        <Text size="xs" c="dimmed" mt={4}>
                                            Current: <span style={{ color: '#7B3FF2' }}>{initialData.companyLogoUrl.split('/').pop()}</span>
                                            {' '}— upload a new file to replace
                                        </Text>
                                    )}
                                </div>
                            </div>

                            {/* ── Row 2: Location · Job Type · Experience ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'flex-start' }}>
                                {/* Location */}
                                <div>
                                    {!showCustomLocation ? (
                                        <Select
                                            required
                                            label="Location"
                                            placeholder="Choose preferred location"
                                            data={locationOptions}
                                            value={formData.location || null}
                                            error={errors.location}
                                            onChange={(v) => { handleLocationChange(v); setErrors(p => ({ ...p, location: '' })); }}
                                            radius="md" size="md"
                                        />
                                    ) : (
                                        <TextInput
                                            radius="md" size="md" required autoFocus
                                            label="Location"
                                            placeholder="Type your location…"
                                            value={formData.location}
                                            error={errors.location}
                                            onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setErrors(p => ({ ...p, location: '' })); }}
                                            rightSection={
                                                <ActionIcon
                                                    variant="subtle" color="gray" size="sm"
                                                    onClick={() => { setShowCustomLocation(false); setFormData({ ...formData, location: '' }); }}
                                                    aria-label="Back to list"
                                                >
                                                    <IconX size={13} />
                                                </ActionIcon>
                                            }
                                        />
                                    )}
                                </div>

                                {/* Job Type */}
                                <Select
                                    required
                                    label="Job Type"
                                    placeholder="Select job type"
                                    data={['Full-time', 'Remote', 'Part-time', 'Contract', 'Internship']}
                                    value={formData.jobType}
                                    error={errors.jobType}
                                    onChange={(value) => { setFormData({ ...formData, jobType: value as FormData['jobType'] }); setErrors(p => ({ ...p, jobType: '' })); }}
                                    radius="md" size="md"
                                />

                                {/* Experience */}
                                <ExperiencePicker
                                    preset={formData.experiencePreset}
                                    custom={formData.experienceCustom}
                                    error={errors.experience}
                                    onPresetChange={(v) => { setFormData({ ...formData, experiencePreset: v, experienceCustom: '' }); setErrors(p => ({ ...p, experience: '' })); }}
                                    onCustomChange={(v) => { setFormData({ ...formData, experienceCustom: v }); setErrors(p => ({ ...p, experience: '' })); }}
                                    required
                                />
                            </div>

                            {/* ── Row 3: Salary Min · Salary Max · Application Deadline ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'flex-start' }}>
                                <NumberInput
                                    radius="md" size="md" required
                                    label="Salary Min" placeholder="4"
                                    min={0} step={0.1} decimalScale={1} suffix=" LPA"
                                    value={formData.salaryMin / 100000}
                                    error={errors.salaryMin}
                                    onChange={(value) => { setFormData({ ...formData, salaryMin: Number(value) * 100000 }); setErrors(p => ({ ...p, salaryMin: '' })); }}
                                />
                                <NumberInput
                                    radius="md" size="md" required
                                    label="Salary Max" placeholder="6"
                                    min={0} step={0.1} decimalScale={1} suffix=" LPA"
                                    value={formData.salaryMax / 100000}
                                    error={errors.salaryMax}
                                    onChange={(value) => { setFormData({ ...formData, salaryMax: Number(value) * 100000 }); setErrors(p => ({ ...p, salaryMax: '' })); }}
                                />
                                <CompactDatePicker
                                    label="Application Deadline"
                                    required
                                    error={errors.applicationDeadline}
                                    value={formData.applicationDeadline}
                                    onChange={(date) => { setFormData({ ...formData, applicationDeadline: date || new Date() }); setErrors(p => ({ ...p, applicationDeadline: '' })); }}
                                />

                            </div>
                            {/* ── Textareas ── */}
                            <Textarea
                                required label="Job Description"
                                placeholder="Provide job details"
                                minRows={3} autosize maxRows={4} radius="md"
                                value={formData.jobDescription}
                                error={errors.jobDescription}
                                onChange={(e) => { setFormData({ ...formData, jobDescription: e.target.value }); setErrors(p => ({ ...p, jobDescription: '' })); }}
                            />
                            <Textarea
                                required label="Requirements"
                                placeholder="List job requirements (e.g., skills, qualifications, experience)"
                                minRows={3} autosize maxRows={4} radius="md"
                                value={formData.requirements}
                                error={errors.requirements}
                                onChange={(e) => { setFormData({ ...formData, requirements: e.target.value }); setErrors(p => ({ ...p, requirements: '' })); }}
                            />
                            <Textarea
                                required label="Responsibilities"
                                placeholder="List key job responsibilities and duties"
                                minRows={3} autosize maxRows={4} radius="md"
                                value={formData.responsibilities}
                                error={errors.responsibilities}
                                onChange={(e) => { setFormData({ ...formData, responsibilities: e.target.value }); setErrors(p => ({ ...p, responsibilities: '' })); }}
                            />

                        </Stack>
                    )}
                </form>
            </div>

            {/* ── Sticky footer buttons ── */}
            <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #f1f3f5',
                background: '#fff',
                borderRadius: '0 0 16px 16px',
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <Button
                    variant="outline"
                    color="violet"
                    onClick={handleDraftSave}
                    disabled={isLoading}
                    leftSection={<IconArrowDown size={16} />}
                    radius="md"
                >
                    {isLoading ? (isUpdate ? 'Saving...' : 'Saving Draft...') : (isUpdate ? 'Save Changes' : 'Save Draft')}
                </Button>
                <Button
                    type="submit"
                    color="violet"
                    loading={isLoading}
                    rightSection={<IconArrowRight size={16} />}
                    radius="md"
                    onClick={handleSubmit}
                >
                    {isLoading ? (isUpdate ? 'Updating...' : 'Publishing...') : (isUpdate ? 'Update & Publish' : 'Publish')}
                </Button>
            </div>

        </Modal >
    );
}