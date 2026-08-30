import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'naira',
  standalone: true
})
export class CurrencyNairaPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showDecimals: boolean = true): string {
    if (value === null || value === undefined || value === '') {
      return '₦0.00';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '₦0.00';

    return '₦' + num.toLocaleString('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });
  }
}

