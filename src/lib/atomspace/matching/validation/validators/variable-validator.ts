export class VariableValidator {
  private static readonly VARIABLE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

  static validateName(name: string | undefined): boolean {
    if (!name) return false;
    return this.VARIABLE_NAME_REGEX.test(name);
  }

  static validateBinding(
    variableName: string,
    existingValue: any,
    newValue: any
  ): boolean {
    if (!existingValue) return true;
    return JSON.stringify(existingValue) === JSON.stringify(newValue);
  }

  static validateTypeRestriction(
    variableName: string,
    value: any,
    typeRestriction: any
  ): boolean {
    if (!typeRestriction) return true;
    return typeof value === typeRestriction;
  }
}