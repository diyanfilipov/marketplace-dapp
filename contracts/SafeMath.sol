pragma solidity ^0.4.24;

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        if (a == 0) {
          return 0;
        }

        c = a * b;
        assert(c / a == b);
        return c;
      }

      function div(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b > 0);
        return a / b; // Solidity automatically throws when dividing by 0
      }

      function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
      }

      function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        assert(c >= a);
        return c;
    }
}
