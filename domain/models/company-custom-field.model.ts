/**
 * Company Custom Field Domain Model
 * 
 * Represents custom fields that can be added to companies.
 */

export enum CustomFieldType {
  String = 1,
  Number = 2,
  Boolean = 3,
  Date = 4,
  Json = 5,
}

export interface CompanyCustomFieldData {
  id: string; // Encrypted GUID
  companyId: string; // Encrypted GUID
  fieldName: string;
  fieldType: CustomFieldType;
  fieldValue: string | null; // JSON string for complex types
  createdAt: string;
  updatedAt: string | null;
}

export class CompanyCustomField {
  public readonly id: string;
  public readonly companyId: string;
  public readonly fieldName: string;
  public readonly fieldType: CustomFieldType;
  public readonly fieldValue: string | null;
  public readonly createdAt: string;
  public readonly updatedAt: string | null;

  constructor(data: CompanyCustomFieldData) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.fieldName = data.fieldName;
    this.fieldType = data.fieldType;
    this.fieldValue = data.fieldValue;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Get field's display name
   */
  get displayName(): string {
    return this.fieldName;
  }

  /**
   * Get typed value based on field type
   */
  get typedValue(): any {
    if (!this.fieldValue) return null;
    
    switch (this.fieldType) {
      case CustomFieldType.Number:
        return parseFloat(this.fieldValue);
      case CustomFieldType.Boolean:
        return this.fieldValue === 'true' || this.fieldValue === '1';
      case CustomFieldType.Date:
        return new Date(this.fieldValue);
      case CustomFieldType.Json:
        try {
          return JSON.parse(this.fieldValue);
        } catch {
          return null;
        }
      default:
        return this.fieldValue;
    }
  }

  /**
   * Get formatted value for display
   */
  get formattedValue(): string {
    const value = this.typedValue;
    if (value === null || value === undefined) return "-";
    
    switch (this.fieldType) {
      case CustomFieldType.Date:
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      case CustomFieldType.Boolean:
        return value ? "Yes" : "No";
      case CustomFieldType.Json:
        return JSON.stringify(value, null, 2);
      default:
        return String(value);
    }
  }
}

export interface CreateCompanyCustomFieldRequestData {
  companyId: string;
  fieldName: string;
  fieldType: CustomFieldType;
  fieldValue: string | number | boolean | Date | object | null;
}

export class CreateCompanyCustomFieldRequest {
  public readonly companyId: string;
  public readonly fieldName: string;
  public readonly fieldType: CustomFieldType;
  public readonly fieldValue: string | null;

  constructor(data: CreateCompanyCustomFieldRequestData) {
    this.companyId = data.companyId;
    this.fieldName = data.fieldName;
    this.fieldType = data.fieldType;
    
    // Convert value to string based on type
    if (data.fieldValue === null || data.fieldValue === undefined) {
      this.fieldValue = null;
    } else {
      switch (data.fieldType) {
        case CustomFieldType.Json:
          this.fieldValue = JSON.stringify(data.fieldValue);
          break;
        case CustomFieldType.Date:
          this.fieldValue = data.fieldValue instanceof Date 
            ? data.fieldValue.toISOString() 
            : String(data.fieldValue);
          break;
        default:
          this.fieldValue = String(data.fieldValue);
      }
    }
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.companyId && this.fieldName && this.fieldName.trim().length > 0);
  }
}

export interface UpdateCompanyCustomFieldRequestData {
  id: string;
  companyId: string;
  fieldName?: string;
  fieldType?: CustomFieldType;
  fieldValue?: string | number | boolean | Date | object | null;
}

export class UpdateCompanyCustomFieldRequest {
  public readonly id: string;
  public readonly companyId: string;
  public readonly fieldName?: string;
  public readonly fieldType?: CustomFieldType;
  public readonly fieldValue?: string | null;

  constructor(data: UpdateCompanyCustomFieldRequestData) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.fieldName = data.fieldName;
    this.fieldType = data.fieldType;
    
    if (data.fieldValue !== undefined) {
      if (data.fieldValue === null) {
        this.fieldValue = null;
      } else if (data.fieldType) {
        switch (data.fieldType) {
          case CustomFieldType.Json:
            this.fieldValue = JSON.stringify(data.fieldValue);
            break;
          case CustomFieldType.Date:
            this.fieldValue = data.fieldValue instanceof Date 
              ? data.fieldValue.toISOString() 
              : String(data.fieldValue);
            break;
          default:
            this.fieldValue = String(data.fieldValue);
        }
      } else {
        this.fieldValue = String(data.fieldValue);
      }
    }
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && this.companyId && (this.fieldName === undefined || this.fieldName.trim().length > 0));
  }
}

