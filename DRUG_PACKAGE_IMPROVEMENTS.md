# Drug Package Information Improvements

## Overview
This document outlines the comprehensive improvements made to the pharmaceutical management system to support enhanced drug package information, pricing calculations, and seamless integration across all drug-related features.

## Key Improvements

### 1. Enhanced Drug Interface
The core `Drug` interface has been significantly enhanced with new fields:

```typescript
export interface Drug {
    id: string;
    name: string;
    generic: string;           // NEW: Generic drug name
    brand: string;
    category: string;
    type: string;              // NEW: Drug subclassification
    dosageForm: string;        // NEW: Physical form of medication
    quantity: number;
    price: number;
    packageInfo?: {            // NEW: Complete package information
        isPackaged: boolean;
        unitsPerPack?: number;
        packsPerCarton?: number;
        packPrice?: number;
        cartonPrice?: number;
    };
    expiryDate: string;
    batchNumber: string;
    requiresPrescription: boolean;
    createdAt: string;
    updatedAt: string;
}
```

### 2. Database Schema Updates

#### Server-side Model (`server/src/models/drug.model.ts`)
- Added new required fields: `generic`, `type`, `dosageForm`
- Added `packageInfo` subdocument with validation
- Enhanced indexing for better search performance
- Added validation for package information requirements

#### Key Schema Features:
- **Package Validation**: Ensures pack information is complete when `isPackaged` is true
- **Price Validation**: All prices must be non-negative
- **Quantity Validation**: Units per pack and packs per carton must be at least 1
- **Indexing**: Added text search on generic names and package status

### 3. Enhanced Validation

#### Client-side Validation (`client/src/validations/drug.validation.ts`)
- Added comprehensive validation for all new fields
- Implemented conditional validation for package information
- Added validation rules:
  - Generic name: 2-100 characters
  - Drug type: 2-50 characters
  - Dosage form: 2-50 characters
  - Package validation: Required fields when packaged

#### Package Information Validation:
```typescript
const packageInfoSchema = z.object({
    isPackaged: z.boolean().default(false),
    unitsPerPack: z.number().min(1).optional(),
    packsPerCarton: z.number().min(1).optional(),
    packPrice: z.number().min(0).optional(),
    cartonPrice: z.number().min(0).optional(),
}).refine((data) => {
    if (data.isPackaged) {
        return data.unitsPerPack !== undefined && data.packPrice !== undefined;
    }
    return true;
}, {
    message: 'Pack information is required when drug is packaged',
});
```

### 4. Enhanced API Endpoints

#### New Server Endpoints:
- `GET /drugs/types` - Get all drug types
- `GET /drugs/dosage-forms` - Get all dosage forms
- `GET /drugs/:id/pricing` - Calculate package pricing for a drug

#### Enhanced Search Parameters:
- Added `type`, `dosageForm`, and `isPackaged` filters
- Enhanced text search to include generic names and drug types

### 5. Package Pricing Calculations

#### Utility Functions (`client/src/utils/packagePricing.ts`)
- `calculatePackagePricing()` - Calculate pricing with savings
- `formatCurrency()` - Format currency for display
- `calculateSavingsPercentage()` - Calculate percentage savings
- `getBestPricingOption()` - Determine best pricing for quantity

#### Key Features:
- **Automatic Savings Calculation**: Calculates savings for packs and cartons
- **Best Option Detection**: Determines optimal pricing for given quantities
- **Currency Formatting**: Proper Ghanaian Cedi formatting
- **Percentage Calculations**: Shows percentage savings

### 6. Enhanced UI Components

#### Updated DrugForm (`client/src/components/organisms/DrugForm.tsx`)
- Added fields for generic name, drug type, and dosage form
- Implemented searchable dropdowns for categories, types, and dosage forms
- Added comprehensive package information section
- Conditional rendering based on package status

#### New PackagePricingDisplay Component (`client/src/components/molecules/PackagePricingDisplay.tsx`)
- Displays individual, pack, and carton pricing
- Shows savings calculations and percentages
- Recommends best pricing options for quantities
- Visual indicators for different pricing tiers

### 7. Enhanced Hooks and API Integration

#### New Hooks (`client/src/hooks/useDrugs.ts`)
- `useDrugTypes()` - Fetch drug types
- `useDosageForms()` - Fetch dosage forms
- `usePackagePricing()` - Calculate package pricing

#### Enhanced Data Mapping:
- Updated all drug data mapping to include new fields
- Proper handling of package information
- Backward compatibility with existing data

### 8. Sale System Integration

#### Updated Sale Types (`client/src/types/sale.types.ts`)
- Enhanced `DrugDetails` interface with new fields
- Added package type tracking in sales
- Support for pack and carton sales
- Enhanced sale item tracking

#### New Sale Features:
- Package type selection in sales
- Units, packs, and cartons sold tracking
- Enhanced pricing calculations for different package types

## Usage Examples

### 1. Creating a Drug with Package Information
```typescript
const drugData = {
    name: "Panadol Extra",
    generic: "Paracetamol",
    brand: "Panadol",
    category: "Analgesics",
    type: "Non-Opioid",
    dosageForm: "tablet",
    quantity: 1000,
    price: 0.50,
    packageInfo: {
        isPackaged: true,
        unitsPerPack: 10,
        packsPerCarton: 50,
        packPrice: 4.50,
        cartonPrice: 200
    },
    expiryDate: "2025-12-31",
    batchNumber: "PANX2023",
    requiresPrescription: false
};
```

### 2. Calculating Package Pricing
```typescript
import { calculatePackagePricing } from '../utils/packagePricing';

const pricing = calculatePackagePricing(drug.price, drug.packageInfo);
// Returns: {
//   individualPrice: 0.50,
//   packPrice: 4.50,
//   cartonPrice: 200,
//   packSavings: 0.50,
//   cartonSavings: 25
// }
```

### 3. Finding Best Pricing Option
```typescript
import { getBestPricingOption } from '../utils/packagePricing';

const bestOption = getBestPricingOption(25, drug.price, drug.packageInfo);
// Returns best pricing option for 25 units
```

## Benefits

### 1. Enhanced Inventory Management
- Better categorization with drug types and dosage forms
- Improved search and filtering capabilities
- More detailed drug information tracking

### 2. Flexible Pricing
- Support for individual, pack, and carton pricing
- Automatic savings calculations
- Best pricing recommendations

### 3. Improved User Experience
- Searchable dropdowns for common values
- Visual pricing displays with savings
- Conditional form sections

### 4. Better Sales Tracking
- Package type tracking in sales
- Enhanced reporting capabilities
- Improved inventory management

### 5. Scalability
- Extensible package information structure
- Support for future pricing models
- Backward compatibility

## Migration Notes

### Database Migration
Existing drugs will need to be updated with the new required fields:
- `generic`: Set to drug name if not available
- `type`: Set to category if not available
- `dosageForm`: Set to "tablet" as default
- `packageInfo`: Set to `{ isPackaged: false }` if not available

### API Compatibility
- All existing API endpoints remain functional
- New endpoints are additive and don't break existing functionality
- Enhanced search parameters are optional

### Frontend Compatibility
- Existing components continue to work
- New fields are optional in forms
- Enhanced displays show additional information when available

## Future Enhancements

### 1. Advanced Package Types
- Support for different package sizes
- Bulk pricing tiers
- Seasonal pricing

### 2. Enhanced Reporting
- Package sales analytics
- Pricing optimization reports
- Inventory turnover by package type

### 3. Supplier Integration
- Package information from suppliers
- Automated pricing updates
- Bulk import capabilities

### 4. Customer Features
- Package preference settings
- Bulk order capabilities
- Subscription services

## Conclusion

These improvements provide a solid foundation for advanced pharmaceutical inventory management with flexible pricing models and enhanced user experience. The system is now capable of handling complex package information while maintaining backward compatibility and providing clear upgrade paths for future enhancements.
