'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { Sheet } from '@/components/ui';
import { EMOJI_CHOICES } from '@/lib/defaults';
import { useStore } from '@/lib/store';
import type { Kind } from '@/lib/types';

const KIND_LABEL: Record<Kind, string> = {
  expense: 'Зарлагын',
  income: 'Орлогын',
  saving: 'Хуримтлалын',
};

/** Шинэ ангилал нэмэх цонх. */
export function CategorySheet({ kind, onClose }: { kind: Kind | null; onClose: () => void }) {
  return (
    <Sheet open={!!kind} onClose={onClose}>
      {kind && <CategoryForm key={kind} kind={kind} onClose={onClose} />}
    </Sheet>
  );
}

function CategoryForm({ kind, onClose }: { kind: Kind; onClose: () => void }) {
  const { addCategory } = useStore();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    addCategory({ name: name.trim(), emoji, kind });
    onClose();
  };

  return (
    <div className="overflow-y-auto px-5 pb-6">
      <div className="flex items-center">
        <button onClick={onClose} aria-label="Хаах" className="size-10 text-ink-muted">
          <X size={26} />
        </button>
        <h3 className="flex-1 text-center text-lg font-semibold text-ink">{KIND_LABEL[kind]} төрөл нэмэх</h3>
        <div className="w-10" />
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-2xl bg-surface px-4">
        <span className="text-3xl">{emoji}</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="Төрлийн нэр"
          className="flex-1 bg-transparent py-4 text-lg text-ink outline-none placeholder:text-gray-400"
        />
      </label>

      <p className="mb-3 mt-5 font-semibold text-ink">Дүрс сонгох</p>
      <div className="grid grid-cols-7 gap-2">
        {EMOJI_CHOICES.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`grid aspect-square place-items-center rounded-xl text-2xl ${e === emoji ? 'border-2 border-brand bg-brand-soft' : 'bg-surface'}`}>
            {e}
          </button>
        ))}
      </div>

      <button
        onClick={save}
        disabled={!canSave}
        className={`mt-6 w-full rounded-full bg-brand py-4 text-lg font-semibold text-white ${canSave ? 'active:opacity-80' : 'opacity-40'}`}>
        Нэмэх
      </button>
    </div>
  );
}
