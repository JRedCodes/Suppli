import { useState } from 'react';
import { Input } from '../ui/Input';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import type { OrderLine } from '../../services/orders.service';

export interface OrderLineRowProps {
  line: OrderLine;
  onQuantityChange?: (lineId: string, quantity: number) => void;
  disabled?: boolean;
}

export function OrderLineRow({ line, onQuantityChange, disabled }: OrderLineRowProps) {
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [quantity, setQuantity] = useState(line.final_quantity.toString());

  const handleQuantityBlur = () => {
    const numValue = parseFloat(quantity);
    if (!isNaN(numValue) && numValue >= 0 && numValue !== line.final_quantity) {
      onQuantityChange?.(line.id, numValue);
    } else {
      setQuantity(line.final_quantity.toString());
    }
    setEditingQuantity(false);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
  };

  const handleReset = () => {
    setQuantity(line.recommended_quantity.toString());
    onQuantityChange?.(line.id, line.recommended_quantity);
  };

  const hasChanged = line.final_quantity !== line.recommended_quantity;
  const changePercent =
    line.recommended_quantity > 0
      ? ((line.final_quantity - line.recommended_quantity) / line.recommended_quantity) * 100
      : 0;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{line.products?.name || 'Unknown Product'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {line.recommended_quantity} {line.unit_type}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          {editingQuantity ? (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleQuantityBlur();
                  } else if (e.key === 'Escape') {
                    setQuantity(line.final_quantity.toString());
                    setEditingQuantity(false);
                  }
                }}
                className="w-32"
                disabled={disabled}
                autoFocus
              />
              <span className="text-sm text-gray-500">{line.unit_type}</span>
              <button
                onClick={handleQuantityBlur}
                disabled={disabled}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setQuantity(line.final_quantity.toString());
                  setEditingQuantity(false);
                }}
                disabled={disabled}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {line.final_quantity} {line.unit_type}
                </span>
                {hasChanged && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      changePercent > 20 || changePercent < -20
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {changePercent > 0 ? '+' : ''}
                    {changePercent.toFixed(0)}%
                  </span>
                )}
              </div>
              <button
                onClick={() => setEditingQuantity(true)}
                disabled={disabled}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
                title="Click to edit quantity"
              >
                Edit
              </button>
              {hasChanged && (
                <button
                  onClick={handleReset}
                  disabled={disabled}
                  className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                  title="Reset to recommended quantity"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ConfidenceIndicator level={line.confidence_level} />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600">
          {line.explanation || 'No explanation available'}
        </div>
      </td>
    </tr>
  );
}
