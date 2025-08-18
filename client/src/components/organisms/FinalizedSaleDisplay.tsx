import { Button } from '../atoms/Button';
import type { Sale } from '../../types/sale.types';

interface FinalizedSaleDisplayProps {
    sale: Sale;
    onViewReceipt: () => void;
}

const FinalizedSaleDisplay: React.FC<FinalizedSaleDisplayProps> = ({
    sale,
    onViewReceipt,
}) => (
    <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded text-center">
        <div className="text-lg font-bold text-green-800 mb-2">
            Sale Finalized
        </div>
        <div className="text-green-700 mb-2">
            Sale has been finalized and is ready for payment/printing.
            <br />
            <span className="block text-sm text-green-900 font-semibold">
                Sale ID: {sale._id || sale.id}
            </span>
            <span className="block text-sm text-green-900">
                Total: ₵{sale.totalAmount?.toFixed(2)}
            </span>
        </div>
        <Button onClick={onViewReceipt}>View Receipt</Button>
    </div>
);

export default FinalizedSaleDisplay;
