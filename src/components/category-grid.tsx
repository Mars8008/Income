'use client';

import { useState, type ReactNode } from 'react';

import { CategorySheet } from '@/components/category-sheet';
import { ActionTile, CategoryTile, SectionTitle } from '@/components/ui';
import { useStore } from '@/lib/store';
import type { Category, Kind } from '@/lib/types';

/** Ангиллын 2 баганатай grid + "Төрөл нэмэх" + засах (устгах) горим. */
export function CategoryGrid({
  title,
  kind,
  totals,
  onPick,
  tileIcon = 'add',
  extra,
}: {
  title: string;
  kind: Kind;
  totals: Record<string, number>;
  onPick: (c: Category) => void;
  tileIcon?: 'add' | 'arrow';
  extra?: ReactNode;
}) {
  const { state, deleteCategory } = useStore();
  const [editing, setEditing] = useState(false);
  const [newKind, setNewKind] = useState<Kind | null>(null);
  const categories = state.categories.filter((c) => c.kind === kind);

  const remove = (c: Category) => {
    if (confirm(`"${c.name}" ангиллыг устгах уу?\nЭнэ ангиллын бүх бүртгэл хамт устгагдана.`)) {
      deleteCategory(c.id);
    }
  };

  return (
    <>
      <SectionTitle
        title={title}
        right={
          <button onClick={() => setEditing((e) => !e)} className="text-sm font-semibold text-brand">
            {editing ? 'Болсон' : 'Засах'}
          </button>
        }
      />
      <div className="group/grid grid grid-cols-2 gap-3" data-editing={editing}>
        {categories.map((c) => (
          <CategoryTile
            key={c.id}
            category={c}
            total={totals[c.id] ?? 0}
            icon={tileIcon}
            onClick={() => (editing ? remove(c) : onPick(c))}
            onDelete={() => remove(c)}
          />
        ))}
        <ActionTile label="Төрөл нэмэх" icon="add" onClick={() => setNewKind(kind)} />
        {extra}
      </div>
      <CategorySheet kind={newKind} onClose={() => setNewKind(null)} />
    </>
  );
}
