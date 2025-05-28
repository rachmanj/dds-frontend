'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

import { DistributionType, CreateDistributionTypeRequest, UpdateDistributionTypeRequest } from '@/types/distribution';
import { distributionTypeService } from '@/lib/api/distribution';

// Form validation schema
const distributionTypeSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
    code: z.string().min(1, 'Code is required').length(1, 'Code must be exactly 1 character').toUpperCase(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #FF0000)'),
    priority: z.number().min(1, 'Priority must be at least 1').max(10, 'Priority must be at most 10'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

type FormData = z.infer<typeof distributionTypeSchema>;

interface DistributionTypeFormProps {
    initialData?: DistributionType;
    onSubmit: (data: CreateDistributionTypeRequest | UpdateDistributionTypeRequest) => Promise<void>;
    onCancel: () => void;
}

export function DistributionTypeForm({ initialData, onSubmit, onCancel }: DistributionTypeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [codeValidation, setCodeValidation] = useState<{ isValid: boolean; message: string } | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(distributionTypeSchema),
        defaultValues: {
            name: initialData?.name || '',
            code: initialData?.code || '',
            color: initialData?.color || '#28a745',
            priority: initialData?.priority || 1,
            description: initialData?.description || '',
        },
    });

    // Watch code field for validation
    const codeValue = form.watch('code');

    // Validate code uniqueness
    useEffect(() => {
        const validateCode = async () => {
            if (!codeValue || codeValue.length !== 1) {
                setCodeValidation(null);
                return;
            }

            try {
                const isValid = await distributionTypeService.checkCodeUnique(codeValue, initialData?.id);
                setCodeValidation({
                    isValid,
                    message: isValid ? 'Code is available' : 'Code already exists',
                });
            } catch (error) {
                console.error('Code validation error:', error);
                setCodeValidation(null);
            }
        };

        const timeoutId = setTimeout(validateCode, 500); // Debounce validation
        return () => clearTimeout(timeoutId);
    }, [codeValue, initialData?.id]);

    const handleSubmit = async (data: FormData) => {
        // Check code validation before submitting
        if (codeValidation && !codeValidation.isValid) {
            form.setError('code', { message: 'Code already exists' });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(data);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Name Field */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Urgent" {...field} />
                            </FormControl>
                            <FormDescription>
                                The display name for this distribution type
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Code Field */}
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., U"
                                    maxLength={1}
                                    className="uppercase"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                            </FormControl>
                            <FormDescription>
                                Single character code used in distribution numbers
                                {codeValidation && (
                                    <span className={`ml-2 text-sm ${codeValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                        {codeValidation.message}
                                    </span>
                                )}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Color Field */}
                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="color"
                                        className="w-16 h-10 p-1 border rounded"
                                        {...field}
                                    />
                                    <Input
                                        placeholder="#28a745"
                                        className="flex-1"
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.startsWith('#')) {
                                                field.onChange(value);
                                            } else {
                                                field.onChange(`#${value}`);
                                            }
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormDescription>
                                Color used for visual identification of this distribution type
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Priority Field */}
                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    placeholder="1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                            </FormControl>
                            <FormDescription>
                                Priority level (1-10, where 1 is highest priority)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description Field */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Optional description for this distribution type..."
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Optional description to explain when this type should be used
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || (codeValidation !== null && !codeValidation.isValid)}
                    >
                        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 