import hashlib
import random
from typing import Tuple, Optional

class SchnorrSignature:
    # Curve parameters - using secp256k1 parameters
    P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
    N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
    G_x = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
    G_y = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8

    @staticmethod
    def point_add(P1: Optional[Tuple[int, int]], P2: Tuple[int, int]) -> Tuple[int, int]:
        if P1 is None:
            return P2
        if P2 is None:
            return P1
        
        x1, y1 = P1
        x2, y2 = P2
        
        if x1 == x2 and y1 == y2:
            # Point doubling
            lam = (3 * x1 * x1) * pow(2 * y1, SchnorrSignature.P - 2, SchnorrSignature.P)
        else:
            # Point addition
            lam = ((y2 - y1) * pow(x2 - x1, SchnorrSignature.P - 2, SchnorrSignature.P))
        
        lam = lam % SchnorrSignature.P
        x3 = (lam * lam - x1 - x2) % SchnorrSignature.P
        y3 = (lam * (x1 - x3) - y1) % SchnorrSignature.P
        
        return (x3, y3)

    @staticmethod
    def point_mul(k: int, P: Tuple[int, int]) -> Tuple[int, int]:
        result = None
        addend = P

        while k:
            if k & 1:
                result = SchnorrSignature.point_add(result, addend)
            addend = SchnorrSignature.point_add(addend, addend)
            k >>= 1

        return result

    def __init__(self):
        self.G = (self.G_x, self.G_y)

    def generate_keypair(self) -> Tuple[int, Tuple[int, int]]:
        """Generate a private key and corresponding public key."""
        private_key = random.randrange(1, self.N)
        public_key = self.point_mul(private_key, self.G)
        return private_key, public_key

    def tag_hash(self, m: bytes, R: Tuple[int, int], P: Tuple[int, int]) -> int:
        """Compute the tagged hash for Schnorr signature."""
        data = R[0].to_bytes(32, 'big') + R[1].to_bytes(32, 'big') + \
               P[0].to_bytes(32, 'big') + P[1].to_bytes(32, 'big') + m
        return int.from_bytes(hashlib.sha256(data).digest(), 'big')

    def sign(self, private_key: int, message: bytes) -> Tuple[Tuple[int, int], int]:
        """Generate a Schnorr signature for a message."""
        public_key = self.point_mul(private_key, self.G)
        k = random.randrange(1, self.N)
        R = self.point_mul(k, self.G)
        e = self.tag_hash(message, R, public_key)
        s = (k + e * private_key) % self.N
        return R, s

    def verify(self, public_key: Tuple[int, int], message: bytes, 
               signature: Tuple[Tuple[int, int], int]) -> bool:
        """Verify a Schnorr signature."""
        R, s = signature
        e = self.tag_hash(message, R, public_key)
        
        # sG = R + eP
        sG = self.point_mul(s, self.G)
        R_plus_eP = self.point_add(R, self.point_mul(e, public_key))
        
        return sG == R_plus_eP

# Example usage and tests
def run_tests():
    schnorr = SchnorrSignature()
    
    # Test 1: Basic signing and verification
    private_key, public_key = schnorr.generate_keypair()
    message = b"Hello, Schnorr!"
    signature = schnorr.sign(private_key, message)
    assert schnorr.verify(public_key, message, signature)
    print("Test 1 passed: Basic signing and verification")
    
    # Test 2: Verification with wrong message
    wrong_message = b"Wrong message"
    assert not schnorr.verify(public_key, wrong_message, signature)
    print("Test 2 passed: Verification fails with wrong message")
    
    # Test 3: Batch verification simulation
    messages = [b"Message 1", b"Message 2", b"Message 3"]
    signatures = [schnorr.sign(private_key, m) for m in messages]
    all_valid = all(schnorr.verify(public_key, m, s) 
                   for m, s in zip(messages, signatures))
    assert all_valid
    print("Test 3 passed: Batch verification simulation")

if __name__ == "__main__":
    run_tests()
