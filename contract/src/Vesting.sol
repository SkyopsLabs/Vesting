// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

// OpenZeppelin dependencies
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Vesting
 */
contract Vesting is Ownable, ReentrancyGuard {
    struct VestingPlan {
        address beneficiary;
        uint256 start;
        uint256 duration;
        uint256 interval;
        bool canRevoke;
        uint256 totalAmount;
        uint256 launchPercent;
        uint256 released;
        bool revoked;
    }

    IERC20 public immutable token;

    bytes32[] private planIds;
    mapping(bytes32 => VestingPlan) private plans;
    uint256 private totalAmountVested;
    mapping(address => uint256) private vestingCount;
    address[] public admins;

    event PlanAdded(
        bytes32 indexed planId,
        address indexed beneficiary,
        uint256 totalAmount
    );
    event PlanRevoked(bytes32 indexed planId, uint256 remainingAmount);
    event TokensReleased(bytes32 indexed planId, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    modifier activePlan(bytes32 planId) {
        require(!plans[planId].revoked, "Plan is revoked");
        _;
    }

    modifier onlyAdmin() {
        bool isAdmin = false;
        for (uint256 i = 0; i < admins.length; i++) {
            if (admins[i] == msg.sender) {
                isAdmin = true;
                break;
            }
        }
        require(isAdmin, "Caller is not an admin");
        _;
    }

    constructor(address token_) Ownable(msg.sender) {
        require(token_ != address(0x0), "Invalid token address");
        token = IERC20(token_);
        admins.push(msg.sender); // Add contract deployer to admins
    }

    receive() external payable {}

    fallback() external payable {}

    function addAdmin(address admin) external onlyAdmin {
        admins.push(admin);
    }

    function addPlan(
        address _beneficiary,
        uint256 _start,
        uint256 _duration,
        uint256 _interval,
        uint256 _launchPercent,
        bool _canRevoke,
        uint256 _amount
    ) external onlyAdmin {
        require(getAvailableAmount() >= _amount, "Insufficient tokens");
        require(_duration > 0, "Duration must be > 0");
        require(_start > 0, "start must be > 0");
        require(_amount > 0, "Amount must be > 0");
        require(_interval >= 1, "Interval must be >= 1");

        bytes32 planId = getNextPlanId(_beneficiary);

        plans[planId] = VestingPlan(
            _beneficiary,
            _start,
            _duration,
            _interval,
            _canRevoke,
            _amount,
            _launchPercent,
            0,
            false
        );

        totalAmountVested += _amount;
        planIds.push(planId);
        unchecked {
            vestingCount[_beneficiary]++;
        }

        emit PlanAdded(planId, _beneficiary, _amount);
    }

    function cancelPlan(bytes32 planId) external onlyOwner activePlan(planId) {
        VestingPlan storage plan = plans[planId];
        require(plan.canRevoke, "Plan cannot be revoked");

        plan.revoked = true;
        uint256 releasableAmount = calculateReleasable(plan);
        if (releasableAmount > 0) {
            releaseTokens(planId, releasableAmount);
        }

        uint256 remainingAmount = plan.totalAmount - plan.released;
        totalAmountVested -= remainingAmount;
        emit PlanRevoked(planId, remainingAmount);
    }

    function withdrawFunds(uint256 amount) external nonReentrant onlyOwner {
        uint256 contractBalance = token.balanceOf(address(this));
        require(
            contractBalance - amount >= totalAmountVested,
            "Insufficient funds for vesting"
        );
        require(getAvailableAmount() >= amount, "Insufficient funds");
        token.transfer(msg.sender, amount);
        emit FundsWithdrawn(msg.sender, amount);
    }

    function releaseTokens(
        bytes32 planId,
        uint256 amount
    ) public nonReentrant activePlan(planId) {
        VestingPlan storage plan = plans[planId];
        bool isAuthorized = (msg.sender == plan.beneficiary ||
            msg.sender == owner());

        require(isAuthorized, "Only beneficiary or owner can release tokens");
        uint256 releasableAmount = calculateReleasable(plan);
        require(releasableAmount >= amount, "Not enough vested tokens");

        plan.released += amount;
        totalAmountVested -= amount;
        token.transfer(payable(plan.beneficiary), amount);
        emit TokensReleased(planId, amount);
    }

    function getPlanCount(
        address _beneficiary
    ) external view returns (uint256) {
        return vestingCount[_beneficiary];
    }

    function getPlanId(uint256 index) external view returns (bytes32) {
        require(index < getPlanTotal(), "Index out of bounds");
        return planIds[index];
    }

    function getPlanByAddressAndIndex(
        address holder,
        uint256 index
    ) external view returns (VestingPlan memory) {
        return getPlan(computePlanId(holder, index));
    }

    function getTotalVested() external view returns (uint256) {
        return totalAmountVested;
    }

    function getPlanTotal() public view returns (uint256) {
        return planIds.length;
    }

    function getReleasableAmount(
        bytes32 planId
    ) external view activePlan(planId) returns (uint256) {
        VestingPlan storage plan = plans[planId];
        return calculateReleasable(plan);
    }

    function getPlan(bytes32 planId) public view returns (VestingPlan memory) {
        return plans[planId];
    }

    function getAvailableAmount() public view returns (uint256) {
        uint256 balance = token.balanceOf(address(this));
        return balance > totalAmountVested ? balance - totalAmountVested : 0;
    }

    function getNextPlanId(address holder) public view returns (bytes32) {
        return computePlanId(holder, vestingCount[holder]);
    }

    function getLastPlan(
        address holder
    ) external view returns (VestingPlan memory) {
        return plans[computePlanId(holder, vestingCount[holder] - 1)];
    }

    function computePlanId(
        address holder,
        uint256 index
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(holder, index));
    }

    function calculateReleasable(
        VestingPlan memory plan
    ) internal view returns (uint256) {
        uint256 currentTime = block.timestamp;
        uint256 launchAmount = (plan.totalAmount * plan.launchPercent) / 100;

        if (plan.revoked) {
            return 0;
        }

        // Before launch, return only the initial unlock amount
        if (currentTime < plan.start) {
            return launchAmount;
        }

        // After full vesting period, return everything remaining
        if (currentTime >= plan.start + plan.duration) {
            return plan.totalAmount - plan.released;
        }

        // Vesting in **discrete** intervals after launch
        uint256 remainingAmount = plan.totalAmount - launchAmount;
        uint256 elapsedTime = currentTime - plan.start;
        uint256 elapsedIntervals = elapsedTime / plan.interval;

        // Total number of intervals available
        uint256 totalIntervals = plan.duration / plan.interval;

        // Ensure we don’t release more than possible
        if (elapsedIntervals > totalIntervals) {
            elapsedIntervals = totalIntervals;
        }

        uint256 vestedAmount = (remainingAmount * elapsedIntervals) /
            totalIntervals;
        uint256 totalVested = vestedAmount + launchAmount;

        return totalVested > plan.released ? totalVested - plan.released : 0;
    }

    function getNextReleaseTime(
        address beneficiary
    ) public view returns (uint256) {
        bytes32 planId = computePlanId(
            beneficiary,
            vestingCount[beneficiary] - 1
        );
        VestingPlan storage plan = plans[planId];

        require(plan.beneficiary != address(0), "No active vesting plan found");

        uint256 currentTime = block.timestamp;

        // If vesting has ended, return 0
        if (currentTime >= plan.start + plan.duration) {
            return 0;
        }

        // If launch time is not reached, next release is at launch
        if (currentTime < plan.start) {
            return plan.start;
            // return 2;
        }

        // Calculate next interval release time
        uint256 elapsedTime = currentTime - plan.start;
        uint256 elapsedPeriods = elapsedTime / plan.interval;
        uint256 nextReleaseTime = plan.start +
            (elapsedPeriods + 1) *
            plan.interval;

        return nextReleaseTime;
    }
}
