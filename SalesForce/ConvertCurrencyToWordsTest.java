@isTest
private class ConvertCurrencyToWordsTest {
    @isTest static void testconvert_nn() {
      String tens = ConvertCurrencyToWords.convert_nn(70);
      System.assertEquals("Seventy",tens);
      String tens2 = ConvertCurrencyToWords.convert_nn(10);
      System.assertEquals("Ten", tens2);
      String tens3 = ConvertCurrencyToWords.convert_nn(100);
      System.assertEquals("One Hundred", tens3);
      String tens4 = ConvertCurrencyToWords.convert_nn(1000);
      System.assertEquals("Should never get here, less than 100 failure", tens4);
  }

  @isTest static void testconvert_nnn() {
    String thous = ConvertCurrencyToWords.convert_nnn(2000);
    System.assertEquals("Two Thousand", thous);

   String thous2 = ConvertCurrencyToWords.convert_nnn(2005);
   System.assertEquals("Two Thousand and Five", thous2);

    String thous3 = ConvertCurrencyToWords.convert_nnn(2100);
    System.assertEquals("Two Thousand One Hundred", thous3);
  }

  @isTest static void testenglish_number() {
    String eng = ConvertCurrencyToWords.english_number(10);
    System.assertEquals("Ten", eng);
    String eng2 = ConvertCurrencyToWords.english_number(105);
    System.assertEquals("One Hundred and Five", eng2);
    String eng3 = ConvertCurrencyToWords.english_number(3000);
    System.assertEquals("Three Thousand", eng3);
  }
}