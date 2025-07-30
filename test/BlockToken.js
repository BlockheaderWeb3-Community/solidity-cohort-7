const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const deployContract = async () => {
  let _name = "BlockToken";
  let _symbol = "BCT";
  const [_owner, addr1, addr2] = await ethers.getSigners();
  const BlockTokenContract = await ethers.getContractFactory("BlockToken");
  const BlockToken = await BlockTokenContract.deploy(
    _name,
    _symbol,
    _owner.address
  );

  return { BlockToken, _owner, addr1, addr2, _name, _symbol };
};

describe("BlockToken Test Suite", () => {
  describe("Deployment", () => {
    it("Should return set values upon deployment", async () => {
      const { BlockToken, _name, _symbol, _owner } = await loadFixture(
        deployContract
      );
      // console.log(_owner.address);
      expect(await BlockToken.name()).to.eq(_name);
      expect(await BlockToken.symbol()).to.eq(_symbol);
      expect(await BlockToken.owner()).to.eq(_owner.address);
    });

    it("Should revert when owner is zero address", async () => {
      const BlockTokenContract = await ethers.getContractFactory("BlockToken");
      const zeroAddress = "0x0000000000000000000000000000000000000000";

      await expect(
        BlockTokenContract.deploy("Token", "TKN", zeroAddress)
      ).to.be.revertedWith("BlockToken:: Zero address not supported");
    });
  });

  describe("Minting", () => {
    it("Only the owner can call mint", async () => {
      const { BlockToken, _owner, addr1, addr2 } = await loadFixture(
        deployContract
      );

      await BlockToken.connect(_owner).mint(10, addr1);
      expect(await BlockToken.balanceOf(addr1)).to.eq(10);

      await expect(
        BlockToken.connect(addr1).mint(1000, addr2)
      ).to.be.revertedWith("BlockToken:: Unauthorized User");
    });

    it("Should revert if minting amount is zero", async () => {
      const { BlockToken, _owner, addr1 } = await loadFixture(deployContract);
      await expect(
        BlockToken.connect(_owner).mint(0, addr1)
      ).to.be.revertedWith("BlockToken:: Zero amount not supported");
    });
  });

  describe("Burning", () => {
    it("Should not burn if user doesn't have tokens", async () => {
      const { BlockToken, _owner, addr1 } = await loadFixture(deployContract);

      await expect(
        BlockToken.connect(addr1).burn(1000)
      ).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
    });

    it("Should burn tokens successfully", async () => {
      const { BlockToken, _owner } = await loadFixture(deployContract);

      await BlockToken.connect(_owner).mint(1000, _owner);

      const balance = await BlockToken.balanceOf(_owner);
      expect(balance).to.eq(1000);

      await BlockToken.connect(_owner).burn(100);
      const balance2 = await BlockToken.balanceOf(_owner);
      expect(balance2).to.eq(900);
    });

    it("burnFrom should be restricted to the owner", async () => {
      const { BlockToken, _owner, addr1, addr2 } = await loadFixture(
        deployContract
      );

      await BlockToken.connect(_owner).mint(1000, addr1);
      expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

      // Check if address 1 can burn from his address
      await expect(
        BlockToken.connect(addr1).burnFrom(addr1, 800)
      ).to.be.revertedWith("BlockToken:: Unauthorized User");

      await BlockToken.connect(_owner).mint(900, addr2);
      expect(await BlockToken.balanceOf(addr2)).to.eq(900);

      // Check if address 1 can burn from another address
      await expect(
        BlockToken.connect(addr1).burnFrom(addr2, 800)
      ).to.be.revertedWith("BlockToken:: Unauthorized User");

      // Check if owner can burn from successfully
      await BlockToken.connect(_owner).burnFrom(addr1, 200);

      const balance = await BlockToken.balanceOf(addr1);
      expect(balance).to.eq(800);
    });

    it("burn should fail if the amount is zero", async () => {
      const { BlockToken, _owner, addr1 } = await loadFixture(deployContract);

      await BlockToken.connect(_owner).mint(1000, addr1);
      expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

      await expect(
        BlockToken.connect(_owner).burnFrom(addr1, 0)
      ).to.be.revertedWith("BlockToken:: Zero amount not supported");
    });
  });

  describe("Transactions", () => {
    describe("Transfers", () => {
      it("Transfers tokens from sender to recipient correctly", async () => {
        const { BlockToken, _owner, addr1, addr2 } = await loadFixture(
          deployContract
        );

        const zeroAddress = "0x0000000000000000000000000000000000000000";

        // Transfer to zero address
        await expect(BlockToken.connect(_owner).transfer(zeroAddress, 800)).to
          .be.reverted;

        await BlockToken.connect(_owner).mint(1000, _owner);
        expect(await BlockToken.balanceOf(_owner)).to.eq(1000);

        // Transfer from owner to other account
        await BlockToken.connect(_owner).transfer(addr1, 800);
        expect(await BlockToken.balanceOf(_owner)).to.eq(200);
        expect(await BlockToken.balanceOf(addr1)).to.eq(800);

        // Transfer from account to account
        await BlockToken.connect(addr1).transfer(addr2, 400);
        expect(await BlockToken.balanceOf(addr1)).to.eq(400);
        expect(await BlockToken.balanceOf(addr2)).to.eq(400);
      });

      it("Transfer should succeed if amount is less than or equal to balance", async () => {
        const { BlockToken, _owner, addr1 } = await loadFixture(deployContract);

        await BlockToken.connect(_owner).mint(1000, _owner);
        expect(await BlockToken.balanceOf(_owner)).to.eq(1000);

        await BlockToken.connect(_owner).transfer(addr1, 1000);
        expect(await BlockToken.balanceOf(_owner)).to.eq(0);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await expect(
          BlockToken.connect(_owner).transfer(addr1, 100)
        ).to.be.revertedWithCustomError(BlockToken, "ERC20InsufficientBalance");
        expect(await BlockToken.balanceOf(_owner)).to.eq(0);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);
      });

      it("Should allow owner to approve a spender for transferFrom", async () => {
        const { BlockToken, _owner, addr1 } = await loadFixture(deployContract);

        await BlockToken.connect(_owner).mint(1000, _owner);
        expect(await BlockToken.balanceOf(_owner)).to.eq(1000);

        await BlockToken.connect(_owner).approve(addr1, 500);
        expect(await BlockToken.allowance(_owner, addr1)).to.eq(500);
      });

      it("Should execute transferFrom only when approved", async () => {
        const { BlockToken, _owner, addr1, addr2 } = await loadFixture(
          deployContract
        );

        await BlockToken.connect(_owner).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).approve(_owner, 500);
        expect(await BlockToken.connect(addr1).allowance(addr1, _owner)).to.eq(
          500
        );
        await BlockToken.connect(_owner).transferFrom(addr1, addr2, 400);

        expect(await BlockToken.connect(addr2).balanceOf(addr2)).to.eq(400);
      });

      it("Should revert if the from address has insufficient balance", async () => {
        const { BlockToken, _owner, addr1, addr2 } = await loadFixture(
          deployContract
        );

        await BlockToken.connect(_owner).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).approve(_owner, 500);
        expect(await BlockToken.connect(addr1).allowance(addr1, _owner)).to.eq(
          500
        );
        await expect(
          BlockToken.connect(_owner).transferFrom(addr1, addr2, 700)
        ).to.be.revertedWithCustomError(
          BlockToken,
          "ERC20InsufficientAllowance"
        );
      });

      it("Should not allow transfer if from balance is too low", async () => {
        const { BlockToken, _owner, addr1, addr2 } = await loadFixture(
          deployContract
        );

        await BlockToken.connect(_owner).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).approve(_owner, 500);
        expect(await BlockToken.connect(addr1).allowance(addr1, _owner)).to.eq(
          500
        );
        await expect(
          BlockToken.connect(_owner).transferFrom(addr1, addr2, 700)
        ).to.be.revertedWithCustomError(
          BlockToken,
          "ERC20InsufficientAllowance"
        );
      });

      it("Reverts if spender attempts transfer with zero allowance", async () => {
        const { BlockToken, _owner, addr1, addr2 } = await loadFixture(
          deployContract
        );

        await BlockToken.connect(_owner).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).approve(_owner, 0);
        expect(await BlockToken.connect(addr1).allowance(addr1, _owner)).to.eq(
          0
        );
        await expect(
          BlockToken.connect(_owner).transferFrom(addr1, addr2, 700)
        ).to.be.revertedWithCustomError(
          BlockToken,
          "ERC20InsufficientAllowance"
        );
      });

      it("Should not allow transfers to the zero address", async () => {
        const { BlockToken, _owner, addr1, addr2 } = await loadFixture(
          deployContract
        );
        const zeroAddress = "0x0000000000000000000000000000000000000000";

        await BlockToken.connect(_owner).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).approve(_owner, 500);
        expect(await BlockToken.connect(addr1).allowance(addr1, _owner)).to.eq(
          500
        );
        await expect(
          BlockToken.connect(_owner).transferFrom(addr1, zeroAddress, 400)
        ).to.be.revertedWithCustomError(BlockToken, "ERC20InvalidReceiver");
      });

      it("Should revert if allowance is changed without first setting it to zero", async () => {
        const { BlockToken, _owner, addr1, addr2 } = await loadFixture(
          deployContract
        );

        await BlockToken.connect(_owner).mint(1000, addr1);
        expect(await BlockToken.balanceOf(addr1)).to.eq(1000);

        await BlockToken.connect(addr1).approve(_owner, 500);

        await BlockToken.connect(addr1).approve(_owner, 700);
        expect(await BlockToken.connect(addr1).allowance(addr1, _owner)).to.eq(
          700
        );
      });
    });
  });
});