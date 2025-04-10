# Run this codemod using `codegen run delete-dead-imports` OR the `run_codemod` MCP tool.
# Important: if you run this as a regular python file, you MUST run it such that
#  the base directory './' is the base of your codebase, otherwise it will not work.
import codegen
from codegen import Codebase
from typing import Optional


@codegen.function('delete-dead-imports')
def run(codebase: Codebase):
    """
    Remove unused imports from the codebase.
    
    Args:
        codebase (Codebase): The codebase to analyze and modify
    """
    try:
        removed_count = 0
        # Iterate over all import statements in the codebase
        for import_stmt in codebase.imports:
            # Skip side-effect imports (imports without extracted symbols)
            if not import_stmt.name and import_stmt.module:
                print(f"Skipping side-effect import: {import_stmt.module} from {import_stmt.file.path}")
                continue

            # Check if the import statement has no usages
            if not import_stmt.usages:
                # Print a message indicating the removal of the unused import
                print(f"Removing unused import: {import_stmt.name} from {import_stmt.file.path}")
                # Remove the import statement from the file
                import_stmt.remove()
                removed_count += 1

        # Commit changes to persist modifications
        if removed_count > 0:
            print(f"\nRemoved {removed_count} unused imports")
            # Commit changes to the codebase
            codebase.commit()
            
            # Create git commit
            commit = codebase.git_commit(
                message=f"refactor: remove {removed_count} unused imports\n\nAutomatically removed dead imports using codegen codemod."
            )
            
            if commit:
                # Create pull request
                pr = codebase.create_pr(
                    title=f"refactor: remove {removed_count} unused imports",
                    body="""
This PR automatically removes unused imports from the codebase using the delete-dead-imports codemod.

Changes made:
- Removed unused imports while preserving side-effect imports
- Improved code cleanliness and reduced bundle size
- No functional changes

This change was automatically generated using codegen.
                    """.strip()
                )
                print(f"\nCreated PR: {pr.url if pr else 'Failed to create PR'}")
        else:
            print("\nNo unused imports found!")
            
    except Exception as e:
        print(f"Error while processing imports: {str(e)}")
        raise


if __name__ == "__main__":
    print('Parsing codebase...')
    try:
        codebase = Codebase("./")
        print('Running function...')
        codegen.run(run)
    except Exception as e:
        print(f"Failed to initialize or run codemod: {str(e)}")
        raise